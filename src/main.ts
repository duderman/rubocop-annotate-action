import * as core from "@actions/core"
import Annotation from "./annotation"
import parse from "./parser"

async function run(): Promise<void> {
  try {
    const path = core.getInput("path") || "rubocop.json"
    const annotations: Annotation[] = await parse(path)

    for (const annotation of annotations) {
      annotation.write()
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
