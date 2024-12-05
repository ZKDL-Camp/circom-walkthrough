/*
    Copyright 2018 0KIMS association.

    This file is part of snarkJS.

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

// @ts-ignore
import * as fastFile from "fastfile";

// @ts-ignore
export default async function loadSymbols(symFileName) {
  const sym = {
    labelIdx2Name: ["one"],
    varIdx2Name: ["one"],
    componentIdx2Name: [],
  };
  const fd = await fastFile.readExisting(symFileName);
  const buff = await fd.read(fd.totalSize);
  const symsStr = new TextDecoder("utf-8").decode(buff);
  const lines = symsStr.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const arr = lines[i].split(",");
    if (arr.length != 4) continue;
    // @ts-ignore
    if (sym.varIdx2Name[arr[1]]) {
      // @ts-ignore
      sym.varIdx2Name[arr[1]] += "|" + arr[3];
    } else {
      // @ts-ignore
      sym.varIdx2Name[arr[1]] = arr[3];
    }
    // @ts-ignore
    sym.labelIdx2Name[arr[0]] = arr[3];
    // @ts-ignore
    if (!sym.componentIdx2Name[arr[2]]) {
      // @ts-ignore
      sym.componentIdx2Name[arr[2]] = extractComponent(arr[3]);
    }
  }

  await fd.close();

  return sym;

  // @ts-ignore
  function extractComponent(name) {
    const arr = name.split(".");
    arr.pop(); // Remove the lasr element
    return arr.join(".");
  }
}
