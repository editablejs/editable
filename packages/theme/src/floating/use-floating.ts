import { computePosition } from '@floating-ui/dom';
import { deepEqual } from '@editablejs/utils/deep-equal';
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'

import type {
  ComputePositionConfig,
  ReferenceType,
  UseFloatingData,
  UseFloatingOptions,
  UseFloatingReturn,
} from './types';
import { getDPR } from './utils/get-DPR';
import { roundByDPR } from './utils/round-by-DPR';
import { useLatestRef } from './utils/use-latest-ref';
import { useState, useCallback, useRef, flushSync, useMemo } from 'rezon';

/**
 * Provides data to position a floating element.
 * @see https://floating-ui.com/docs/useFloating
 */
export function useFloating<RT extends ReferenceType = ReferenceType>(
  options: UseFloatingOptions = {},
): UseFloatingReturn<RT> {
  const {
    placement = 'bottom',
    strategy = 'absolute',
    middleware = [],
    platform,
    elements: { reference: externalReference, floating: externalFloating } = {},
    transform = true,
    whileElementsMounted,
    open,
  } = options;

  const [data, setData] = useState<UseFloatingData>({
    x: 0,
    y: 0,
    strategy,
    placement,
    middlewareData: {},
    isPositioned: false,
  });

  const [latestMiddleware, setLatestMiddleware] = useState(middleware);

  if (!deepEqual(latestMiddleware, middleware)) {
    setLatestMiddleware(middleware);
  }

  const [_reference, _setReference] = useState<RT | null>(null);
  const [_floating, _setFloating] = useState<HTMLElement | null>(null);

  const setReference = useCallback(
    (node: RT | null) => {
      if (node != referenceRef.current) {
        referenceRef.current = node;
        _setReference(node);
      }
    },
    [_setReference],
  );

  const setFloating = useCallback(
    (node: HTMLElement | null) => {
      if (node !== floatingRef.current) {
        floatingRef.current = node;
        _setFloating(node);
      }
    },
    [_setFloating],
  );

  const referenceEl = (externalReference || _reference) as RT | null;
  const floatingEl = externalFloating || _floating;

  const referenceRef = useRef<RT | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);
  const dataRef = useRef(data);

  const whileElementsMountedRef = useLatestRef(whileElementsMounted);
  const platformRef = useLatestRef(platform);

  const update = useCallback(() => {
    if (!referenceRef.current || !floatingRef.current) {
      return;
    }

    const config: ComputePositionConfig = {
      placement,
      strategy,
      middleware: latestMiddleware,
    };

    if (platformRef.current) {
      config.platform = platformRef.current;
    }

    computePosition(referenceRef.current, floatingRef.current, config).then(
      (data) => {
        const fullData = { ...data, isPositioned: true };
        if (isMountedRef.current && !deepEqual(dataRef.current, fullData)) {
          dataRef.current = fullData;
          flushSync(() => {
            setData(fullData);
          });
        }
      },
    );
  }, [latestMiddleware, placement, strategy, platformRef]);

  useIsomorphicLayoutEffect(() => {
    if (open === false && dataRef.current?.isPositioned) {
      dataRef.current.isPositioned = false;
      setData((data) => ({ ...data, isPositioned: false }));
    }
  }, [open]);

  const isMountedRef = useRef(false);
  useIsomorphicLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (referenceEl) referenceRef.current = referenceEl;
    if (floatingEl) floatingRef.current = floatingEl;

    if (referenceEl && floatingEl) {
      if (whileElementsMountedRef.current) {
        return whileElementsMountedRef.current(referenceEl, floatingEl, update);
      } else {
        update();
      }
    }
  }, [referenceEl, floatingEl, update, whileElementsMountedRef]);

  const refs = useMemo(
    () => ({
      reference: referenceRef,
      floating: floatingRef,
      setReference,
      setFloating,
    }),
    [setReference, setFloating],
  );

  const elements = useMemo(
    () => ({ reference: referenceEl, floating: floatingEl }),
    [referenceEl, floatingEl],
  );

  const floatingStyles = useMemo(() => {
    const initialStyles = {
      position: strategy,
      left: 0,
      top: 0,
    };

    if (!elements.floating) {
      return initialStyles;
    }

    const x = roundByDPR(elements.floating, data.x);
    const y = roundByDPR(elements.floating, data.y);

    if (transform) {
      return {
        ...initialStyles,
        transform: `translate(${x}px, ${y}px)`,
        ...(getDPR(elements.floating) >= 1.5 && { willChange: 'transform' }),
      };
    }

    return {
      position: strategy,
      left: x,
      top: y,
    };
  }, [strategy, transform, elements.floating, data.x, data.y]);

  return useMemo(
    () => ({
      ...data,
      update,
      refs,
      elements,
      floatingStyles,
    }),
    [data, update, refs, elements, floatingStyles],
  );
}
