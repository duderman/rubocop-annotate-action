import {issueCommand} from "@actions/core/lib/command"

type Level = "warning" | "error"

export interface AnnotationProperties {
  file?: string
  line?: number
  col?: number
}

class Annotation {
  message: string
  level: Level = "error"
  properties: AnnotationProperties

  constructor(message: string, properties: AnnotationProperties = {}) {
    this.message = message
    this.properties = properties
  }

  write(): void {
    issueCommand(this.level, this.properties, this.message)
  }
}

export default Annotation
