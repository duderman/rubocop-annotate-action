import parse from "./parser"
import Annotation from "./annotation"

import tempWrite from "temp-write"
import {promises as fs} from "fs"

let mailformedFilePath: string
let jsonFilePath: string

beforeAll(async () => {
  mailformedFilePath = await tempWrite("yo", ".json")
  jsonFilePath = await tempWrite(`{
  "files": [
    {
      "path": "Gemfile",
      "offenses": [
        {
          "severity": "convention",
          "message": "Missing frozen string literal comment.",
          "cop_name": "Style/FrozenStringLiteralComment",
          "corrected": false,
          "correctable": true,
          "location": {
            "start_line": 1,
            "start_column": 1,
            "last_line": 1,
            "last_column": 1,
            "length": 1,
            "line": 1,
            "column": 1
          }
        }
      ]
    },{
      "path": "Gemfile.2",
      "offenses": [
        {
          "severity": "convention",
          "message": "Gems should be sorted in an alphabetical order within their section of the Gemfile",
          "cop_name": "Bundler/OrderedGems",
          "corrected": false,
          "correctable": true,
          "location": {
            "start_line": 5,
            "start_column": 1,
            "last_line": 5,
            "last_column": 24,
            "length": 24,
            "line": 5,
            "column": 1
          }
        }
      ]
    }
  ]
}`)
})

afterAll(async () => {
  await fs.unlink(mailformedFilePath)
  await fs.unlink(jsonFilePath)
})

it("fails with error when file is missing", async () => {
  try {
    await parse("asd")
  } catch (err) {
    expect(err).toEqual(new Error("File 'asd' doesn't exist"))
  }
})

it("fails when json is invalid", async () => {
  try {
    await parse(mailformedFilePath)
  } catch (err) {
    expect(err).toEqual(new Error("Mailformed JSON"))
  }
})

it("parse offenses from all files", async () => {
  const annotations: Annotation[] = await parse(jsonFilePath)

  expect(annotations[0].message).toEqual(
    "[Style/FrozenStringLiteralComment] Missing frozen string literal comment."
  )
  expect(annotations[0].properties.file).toEqual("Gemfile")
  expect(annotations[0].properties.line).toEqual(1)
  expect(annotations[0].properties.col).toEqual(1)

  expect(annotations[1].message).toEqual(
    "[Bundler/OrderedGems] Gems should be sorted in an alphabetical order within their section of the Gemfile"
  )
  expect(annotations[1].properties.file).toEqual("Gemfile.2")
  expect(annotations[1].properties.line).toEqual(5)
  expect(annotations[1].properties.col).toEqual(1)
})
