import { isServer } from "@editablejs/utils"

export interface MutationInterface {
  observe: (target?: Node, options?: MutationObserverInit) => void
  disconnect: () => void
}

export interface ListenMutationInterface { 
  mutation: (records: MutationRecord[]) => void
}

const observeMutation = (mutation: MutationObserver, target: Node = document.body, options?: MutationObserverInit) => {
  mutation.observe(target, options)
}

export const createMutation = (callback: (records: MutationRecord[]) => void): MutationInterface => {
  const mutation = isServer ? { disconnect: () => {}} : new MutationObserver(callback)
  
  return {
    observe: (target: Node = document.body, options: MutationObserverInit = { 
      childList: true,
      subtree: true
    }) => {
      if(!isServer) observeMutation(mutation as any, target, options)
    },
    disconnect: () => mutation.disconnect(),
  }
}

const mutationSet = new Set<ListenMutationInterface>()
let isDisconnect = true
const globalMutation = createMutation((records) => {
  mutationSet.forEach(typing => {
    typing.mutation(records)
  })
})

export const addMutationListen = (typing: ListenMutationInterface) => {
  mutationSet.add(typing)
  if(isDisconnect) {
    globalMutation.observe()
    isDisconnect = false
  }
}

export const removeMutationListen = (typing: ListenMutationInterface) => {
  mutationSet.delete(typing)
  if(mutationSet.size === 0) {
    globalMutation.disconnect()
    isDisconnect = true
  }
}