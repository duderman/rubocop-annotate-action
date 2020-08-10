import Annotation, {AnnotationProperties} from "./annotation"
import {promises as fs} from "fs"
import {resolve} from "path"

type RubocopJSON = {
  files: File[]
}

type File = {
  path: string
  offenses: Offense[]
}

type Offense = {
  cop_name: string
  message: string
  location: OffenseLocation
}

type OffenseLocation = {
  column: number
  line: number
}

type StatError = {
  code: string
}

function isErrorNotFound(err: StatError): boolean {
  return err.code === "ENOENT"
}

async function checkFileExistance(path: string): Promise<void> {
  try {
    await fs.stat(path)
  } catch (err) {
    if (isErrorNotFound(err)) {
      throw new Error(`File '${path}' doesn't exist`)
    }

    throw err
  }
}

async function read(path: string): Promise<string> {
  const fullPath: string = resolve(path)
  await checkFileExistance(fullPath)
  return await fs.readFile(fullPath, "utf8")
}

type AnnotationBuilderFunction = (offense: Offense) => Annotation
function buildAnnotationFromOffense(file: string): AnnotationBuilderFunction {
  return (offense: Offense) => {
    const message = `[${offense.cop_name}] ${offense.message}`
    const properties: AnnotationProperties = {
      file,
      col: offense.location.column,
      line: offense.location.line
    }

    return new Annotation(message, properties)
  }
}

function parseOffenses(file: string, offenses: Offense[]): Annotation[] {
  return offenses.map(buildAnnotationFromOffense(file))
}

function parseJSON(contents: string): RubocopJSON {
  try {
    return JSON.parse(contents)
  } catch (err) {
    throw new Error("Mailformed JSON")
  }
}

export default async function parse(filepath: string): Promise<Annotation[]> {
  const contents: string = await read(filepath)
  const data: RubocopJSON = parseJSON(contents)
  let annotations: Annotation[] = []

  for (const file of data.files) {
    annotations = annotations.concat(parseOffenses(file.path, file.offenses))
  }

  return annotations
}
