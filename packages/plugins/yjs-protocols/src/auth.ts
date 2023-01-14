import * as Y from 'yjs'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'

export const messagePermissionDenied = 0

/**
 * @param encoder
 * @param reason
 */
export const writePermissionDenied = (encoder: encoding.Encoder, reason: string) => {
  encoding.writeVarUint(encoder, messagePermissionDenied)
  encoding.writeVarString(encoder, reason)
}

export type PermissionDeniedHandler = (y: any, reason: string) => void

/**
 *
 * @param decoder
 * @param y
 * @param permissionDeniedHandler
 */
export const readAuthMessage = (
  decoder: decoding.Decoder,
  y: Y.Doc,
  permissionDeniedHandler: PermissionDeniedHandler,
) => {
  switch (decoding.readVarUint(decoder)) {
    case messagePermissionDenied:
      permissionDeniedHandler(y, decoding.readVarString(decoder))
  }
}
