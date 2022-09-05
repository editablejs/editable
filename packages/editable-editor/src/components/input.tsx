import { Range, Selection } from 'slate';
import { FC, useState } from 'react';
import { Editable } from '../plugin/editable';
import {
  EDITOR_TO_INPUT,
  IS_COMPOSING,
  IS_MOUSEDOWN,
} from '../utils/weak-maps';
import { useEditable } from '../hooks/use-editable';
import { useFocused } from '../hooks/use-focused';
import { ShadowRect } from './shadow';
import { getRectsByRange } from '../utils/selection';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

interface InputProps {
  selection: Selection;
}

const InputComponent: FC<InputProps> = ({ selection }) => {
  const editor = useEditable();

  const [focused, setFocused] = useFocused();

  const [rect, setRect] = useState<ShadowRect | null>(null);

  const handleKeydown = (event: React.KeyboardEvent) => {
    const { nativeEvent } = event;
    if (Editable.isComposing(editor) && nativeEvent.isComposing === false) {
      IS_COMPOSING.set(editor, false);
    }

    if (Editable.isComposing(editor)) {
      return;
    }
    editor.onKeydown(nativeEvent);
  };

  const handleKeyup = (event: React.KeyboardEvent) => {
    editor.onKeyup(event.nativeEvent);
  };

  const handleBlur = () => {
    if (!IS_MOUSEDOWN.get(editor)) setFocused(false);
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBeforeInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    if (!(textarea instanceof HTMLTextAreaElement)) return;
    editor.onBeforeInput(textarea.value);
  };

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    if (!(textarea instanceof HTMLTextAreaElement)) return;
    const value = textarea.value;
    if (!IS_COMPOSING.get(editor)) {
      textarea.value = '';
    }
    editor.onInput(value);
  };

  const handleCompositionStart = (ev: React.CompositionEvent) => {
    editor.onCompositionStart(ev.nativeEvent.data);
  };

  const handleCompositionEnd = (ev: React.CompositionEvent) => {
    const textarea = ev.target;
    if (!(textarea instanceof HTMLTextAreaElement)) return;
    const value = textarea.value;
    textarea.value = '';
    editor.onCompositionEnd(value);
  };

  useIsomorphicLayoutEffect(() => {
    if (!selection || !focused) return setRect(null);
    const rects = getRectsByRange(editor, selection);
    if (rects.length === 0) return setRect(null);
    if (Range.isCollapsed(selection)) {
      setRect(rects[0].toJSON());
    } else {
      const rect = rects[rects.length - 1].toJSON();
      rect.left = rect.left + rect.width;
      setRect(rect);
    }
  }, [editor, selection, focused]);

  return (
    <ShadowRect
      rect={Object.assign({}, rect, { color: 'transparent', width: 1 })}
      style={{
        opacity: 0,
        outline: 'none',
        caretColor: 'transparent',
        overflow: 'hidden',
      }}
    >
      <textarea
        ref={(current) => {
          if (current) EDITOR_TO_INPUT.set(editor, current);
        }}
        rows={1}
        style={{
          fontSize: 'inherit',
          lineHeight: 1,
          padding: 0,
          border: 'none',
          whiteSpace: 'nowrap',
          width: '1em',
          overflow: 'auto',
          resize: 'vertical',
        }}
        onKeyDown={handleKeydown}
        onKeyUp={handleKeyup}
        onBeforeInput={handleBeforeInput}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </ShadowRect>
  );
};

export { InputComponent };
