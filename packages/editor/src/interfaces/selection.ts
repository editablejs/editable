import { ExtendedType } from "@/types"
import { Range } from "./range"

export type BaseSelection = Range | null

export type Selection = ExtendedType<'Selection', BaseSelection>
