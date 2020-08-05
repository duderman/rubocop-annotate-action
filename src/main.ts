import * as core from "@actions/core"

async function run(): Promise<void> {
  try {
    core.debug("im alive")
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
