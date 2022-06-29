import { ModelInterface } from '@editablejs/model';
import { getPositionFromEvent, queryElements } from "./utils";
import { addMutationListen, createMutation, ListenMutationInterface, MutationInterface, removeMutationListen } from "./mutation";
import Range, { Position } from './range';
import { SelectionInterface } from './types';
import { clearRanges, getRanges } from './range-weakmap';
import { getInputLayer } from './draw';

export interface TypingInterface extends ListenMutationInterface {

  onContainerRendered(container: HTMLElement): void

  onRootRendered(containers: HTMLElement[]): void

  onMouseDown(event: MouseEvent, position?: Position): void

  onMouseMove(event: MouseEvent, position?: Position): void

  onMouseUp(event: MouseEvent, position?: Position): void

  startMutation(): void
  
  stopMutation(): void
}

const CONTAINERS_TO_TYPING_WEAK_MAP = new WeakMap<HTMLElement, TypingInterface>()
const CONATINER_TO_MUTATION_MAP = new Map<HTMLElement, MutationInterface>()
const CONTAINERS_LISTEN_WEAK_MAP = new WeakMap<ListenMutationInterface, HTMLElement[]>()

const TYPING_WEAK_MAP = new WeakMap<SelectionInterface, TypingInterface>();

const SELECT_START_POSITION_WEAKMAP = new WeakMap<SelectionInterface, Position>()
const SELECT_END_POSITION_WEAKMAP = new WeakMap<SelectionInterface, Position>()

const handleSelecting = (selection: SelectionInterface, position?: Position) => { 
  if(!SELECT_START_POSITION_WEAKMAP.has(selection) || !position) return
  SELECT_END_POSITION_WEAKMAP.set(selection, position)
  const anchor = SELECT_START_POSITION_WEAKMAP.get(selection)!
  const { key: anchorKey, offset: anchorOffset } = anchor
  const { key: focusKey, offset: focusOffset } = position
  const range = new Range(anchorKey, anchorOffset, focusKey, focusOffset)
  const ranges = getRanges(selection)
  if(ranges.length === 1 && ranges[0].equal(range)) {
    getInputLayer(selection)?.focus()
    return
  }
  clearRanges(selection)
  selection.addRange(range)
  return range
}

export const createTyping = (selection: SelectionInterface, model: ModelInterface) => {

  const handleMouseDown = (event: MouseEvent) => {
    const position = getPositionFromEvent(model, event)
    if(position) {
      SELECT_START_POSITION_WEAKMAP.set(selection, position)
      const range = handleSelecting(selection, position)
      if(range) selection.onSelectStart()
    }
    else SELECT_START_POSITION_WEAKMAP.delete(selection)
    if(event.button === 0) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  const handleMouseMove = (event: MouseEvent) => { 
    const position = getPositionFromEvent(model, event)
    const range = handleSelecting(selection, position)
    if(range) selection.onSelecting()
  }
  
  const handleMouseUp = (event: MouseEvent) => { 
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    const range = handleSelecting(selection, getPositionFromEvent(model, event))
    if(range) selection.onSelectEnd()
  }

  const typing: TypingInterface = {
    mutation(){
      const keys = model.getRootKeys()
      const containers: HTMLElement[] = queryElements(model, ...keys)
      const removeContainer = (container: HTMLElement) => {
        container.removeEventListener('mousedown', handleMouseDown);
        const observer = CONATINER_TO_MUTATION_MAP.get(container)
        if(observer) {
          observer.disconnect()
          CONATINER_TO_MUTATION_MAP.delete(container)
        }
      }
      let isChange = false
      for(let i = 0; i < containers.length; i++) {
        const container = containers[i]
        const has = CONTAINERS_TO_TYPING_WEAK_MAP.has(container)
        if(!has) {
          isChange = true
          container.addEventListener('mousedown', handleMouseDown);
          const mutation = createMutation(() => {
            if(CONTAINERS_TO_TYPING_WEAK_MAP.has(container)) typing.onContainerRendered(container)
            else removeContainer(container)
          })
          mutation.observe(container, {
            childList: true,
            subtree: true,
            characterData: true,
          })
          CONATINER_TO_MUTATION_MAP.set(container, mutation)
          CONTAINERS_TO_TYPING_WEAK_MAP.set(container, typing)
        }
      }
      const oldContainers = CONTAINERS_LISTEN_WEAK_MAP.get(typing)
      oldContainers?.forEach(container => {
        if(CONTAINERS_TO_TYPING_WEAK_MAP.has(container)) return
        isChange = true
        removeContainer(container)
      })
      CONTAINERS_LISTEN_WEAK_MAP.set(typing, containers)
      if(isChange) typing.onRootRendered(containers)
    },
    startMutation(){
      addMutationListen(typing)
    },
    stopMutation() {
      removeMutationListen(typing)
    },
    onContainerRendered(container: HTMLElement){},

    onRootRendered(containers: HTMLElement[]){},

    onMouseDown(event: MouseEvent, position?: Position){},

    onMouseMove(event: MouseEvent, position?: Position){},

    onMouseUp(event: MouseEvent, position?: Position){}
  }

  TYPING_WEAK_MAP.set(selection, typing)
  return typing
}
