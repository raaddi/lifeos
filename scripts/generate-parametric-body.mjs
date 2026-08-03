import fs from "node:fs";
import path from "node:path";

const [, , sourceDir, outputFile] = process.argv;

if (!sourceDir || !outputFile) {
  throw new Error("Usage: node scripts/generate-parametric-body.mjs SOURCE_DIR OUTPUT.glb");
}

function parseObj(file) {
  const positions = [];
  const uvs = [];
  const groups = new Map();
  let group = "default";

  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("v ")) {
      positions.push(line.split(/\s+/).slice(1, 4).map(Number));
    } else if (line.startsWith("vt ")) {
      uvs.push(line.split(/\s+/).slice(1, 3).map(Number));
    } else if (line.startsWith("g ")) {
      group = line.slice(2).trim();
    } else if (line.startsWith("f ")) {
      const face = line.slice(2).split(/\s+/).map((corner) => {
        const [positionIndex, uvIndex] = corner.split("/");
        return { position: Number(positionIndex) - 1, uv: uvIndex ? Number(uvIndex) - 1 : -1 };
      });
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(face);
    }
  }

  return { positions, uvs, groups };
}

function parseTarget(file, vertexCount) {
  const deltas = Array.from({ length: vertexCount }, () => [0, 0, 0]);
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const [index, x, y, z] = line.split(/\s+/);
    deltas[Number(index)] = [Number(x), Number(y), Number(z)];
  }
  return deltas;
}

function faceCenter(face, positions) {
  const result = [0, 0, 0];
  for (const corner of face) {
    const point = positions[corner.position];
    result[0] += point[0] / face.length;
    result[1] += point[1] / face.length;
    result[2] += point[2] / face.length;
  }
  return result;
}

function isBoxerRegion(face, positions) {
  const [x, y] = faceCenter(face, positions);
  return y > -2.25 && y < 0.48 && Math.abs(x) < 1.82;
}

function triangulate(face) {
  const triangles = [];
  for (let index = 1; index < face.length - 1; index += 1) {
    triangles.push([face[0], face[index], face[index + 1]]);
  }
  return triangles;
}

function calculateNormals(positions, triangleLists) {
  const normals = Array.from({ length: positions.length }, () => [0, 0, 0]);
  for (const triangles of triangleLists) {
    for (const triangle of triangles) {
      const [a, b, c] = triangle.map((index) => positions[index]);
      const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const normal = [
        ab[1] * ac[2] - ab[2] * ac[1],
        ab[2] * ac[0] - ab[0] * ac[2],
        ab[0] * ac[1] - ab[1] * ac[0],
      ];
      for (const index of triangle) {
        normals[index][0] += normal[0];
        normals[index][1] += normal[1];
        normals[index][2] += normal[2];
      }
    }
  }

  return normals.map((normal) => {
    const length = Math.hypot(normal[0], normal[1], normal[2]) || 1;
    return [normal[0] / length, normal[1] / length, normal[2] / length];
  });
}

function flatten(values) {
  return values.flatMap((value) => value);
}

function minMax(values) {
  const min = Array(values[0].length).fill(Infinity);
  const max = Array(values[0].length).fill(-Infinity);
  for (const value of values) {
    for (let index = 0; index < value.length; index += 1) {
      min[index] = Math.min(min[index], value[index]);
      max[index] = Math.max(max[index], value[index]);
    }
  }
  return { min, max };
}

const obj = parseObj(path.join(sourceDir, "base.obj"));
const bodyFaces = obj.groups.get("body") ?? [];
const visibleBodyFaces = bodyFaces.filter((face) => !isBoxerRegion(face, obj.positions));
const boxerFaces = bodyFaces.filter((face) => isBoxerRegion(face, obj.positions));

const shapeDefinitions = [
  ["MuscleUp", "muscle-max.target"],
  ["MuscleDown", "muscle-min.target"],
  ["FatUp", "weight-max.target"],
  ["FatDown", "weight-min.target"],
  ["HeightUp", "height-max.target"],
  ["HeightDown", "height-min.target"],
];

const bodyVertexIndices = new Set(bodyFaces.flatMap((face) => face.map((corner) => corner.position)));
const targetDeltas = shapeDefinitions.map(([, file]) => parseTarget(path.join(sourceDir, file), obj.positions.length));
const maleDeltas = parseTarget(path.join(sourceDir, "male.target"), obj.positions.length);
const muscleBaseDeltas = targetDeltas[0];
const BASE_MUSCLE = 0.2;

function relaxArms([x, y, z]) {
  const side = Math.sign(x);
  const distance = Math.abs(x);
  if (!side || distance < 1.25 || y < 0.15) return [x, y, z];
  const blend = Math.min(1, Math.max(0, (distance - 1.25) / 0.95));
  const pivotX = side * 1.55;
  const pivotY = 4.15;
  const angle = side * -0.27;
  const dx = x - pivotX;
  const dy = y - pivotY;
  const rotatedX = pivotX + dx * Math.cos(angle) - dy * Math.sin(angle);
  const rotatedY = pivotY + dx * Math.sin(angle) + dy * Math.cos(angle);
  return [x + (rotatedX - x) * blend, y + (rotatedY - y) * blend, z];
}

function makeShape(components = []) {
  const raw = obj.positions.map((position, index) => {
    const result = [...position];
    for (const [deltas, weight] of components) {
      const delta = deltas[index] ?? [0, 0, 0];
      result[0] += delta[0] * weight;
      result[1] += delta[1] * weight;
      result[2] += delta[2] * weight;
    }
    return relaxArms(result);
  });
  let floor = Infinity;
  for (const index of bodyVertexIndices) floor = Math.min(floor, raw[index][1]);
  return raw.map(([x, y, z]) => [x * 0.1, (y - floor) * 0.1, z * 0.1]);
}

const baseComponents = [[maleDeltas, 1], [muscleBaseDeltas, BASE_MUSCLE]];
const rawShapes = [
  makeShape(baseComponents),
  makeShape([[maleDeltas, 1], [targetDeltas[0], 1]]),
  makeShape([[maleDeltas, 1], [targetDeltas[1], 1]]),
  makeShape([...baseComponents, [targetDeltas[2], 1]]),
  makeShape([...baseComponents, [targetDeltas[3], 1]]),
  makeShape([...baseComponents, [targetDeltas[4], 1]]),
  makeShape([...baseComponents, [targetDeltas[5], 1]]),
];
const cornerMap = new Map();
const sourceCorners = [];
const denseUvs = [];

function denseCorner(corner, variant) {
  const key = `${variant}:${corner.position}/${corner.uv}`;
  if (cornerMap.has(key)) return cornerMap.get(key);
  const denseIndex = sourceCorners.length;
  cornerMap.set(key, denseIndex);
  sourceCorners.push({ position: corner.position, variant });
  const uv = obj.uvs[corner.uv] ?? [0, 0];
  denseUvs.push([uv[0], 1 - uv[1]]);
  return denseIndex;
}

function denseTriangles(faces, variant) {
  return faces.flatMap((face) => triangulate(face).map((triangle) => triangle.map((corner) => denseCorner(corner, variant))));
}

const skinTriangles = denseTriangles(visibleBodyFaces, "skin");
const boxerTriangles = denseTriangles(boxerFaces, "boxer");
const denseShapes = rawShapes.map((shape) => sourceCorners.map(({ position, variant }) => {
  const point = shape[position];
  if (variant !== "boxer") return point;
  const boxerCenterZ = 0.075;
  return [point[0] * 1.035, point[1], boxerCenterZ + (point[2] - boxerCenterZ) * 1.055];
}));
const denseNormals = denseShapes.map((shape) => calculateNormals(shape, [skinTriangles, boxerTriangles]));
const basePositions = denseShapes[0];
const baseNormals = denseNormals[0];
const morphPositionDeltas = denseShapes.slice(1).map((shape) => shape.map((point, index) => point.map((value, axis) => value - basePositions[index][axis])));
const morphNormalDeltas = denseNormals.slice(1).map((shape) => shape.map((normal, index) => normal.map((value, axis) => value - baseNormals[index][axis])));

if (basePositions.length >= 65535) throw new Error(`Model has ${basePositions.length} vertices; use 32-bit indices.`);

const chunks = [];
let byteOffset = 0;
const bufferViews = [];
const accessors = [];

function align4() {
  const padding = (4 - (byteOffset % 4)) % 4;
  if (padding) {
    chunks.push(Buffer.alloc(padding));
    byteOffset += padding;
  }
}

function addBuffer(buffer, target) {
  align4();
  const view = { buffer: 0, byteOffset, byteLength: buffer.byteLength };
  if (target) view.target = target;
  const index = bufferViews.length;
  bufferViews.push(view);
  chunks.push(buffer);
  byteOffset += buffer.byteLength;
  return index;
}

function floatAccessor(values, type, target = 34962) {
  const flat = flatten(values);
  const array = new Float32Array(flat);
  const buffer = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  const range = minMax(values);
  const accessor = { bufferView: addBuffer(buffer, target), componentType: 5126, count: values.length, type, min: range.min, max: range.max };
  accessors.push(accessor);
  return accessors.length - 1;
}

function indexAccessor(triangles) {
  const values = triangles.flat();
  const array = new Uint16Array(values);
  const buffer = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  accessors.push({ bufferView: addBuffer(buffer, 34963), componentType: 5123, count: values.length, type: "SCALAR", min: [Math.min(...values)], max: [Math.max(...values)] });
  return accessors.length - 1;
}

const positionAccessor = floatAccessor(basePositions, "VEC3");
const normalAccessor = floatAccessor(baseNormals, "VEC3");
const uvAccessor = floatAccessor(denseUvs, "VEC2");
const morphAccessors = morphPositionDeltas.map((positions, index) => ({
  POSITION: floatAccessor(positions, "VEC3"),
  NORMAL: floatAccessor(morphNormalDeltas[index], "VEC3"),
}));
const skinIndexAccessor = indexAccessor(skinTriangles);
const boxerIndexAccessor = indexAccessor(boxerTriangles);

const skinPng = fs.readFileSync(path.join(sourceDir, "skin.png"));
const imageBufferView = addBuffer(skinPng);

const attributes = { POSITION: positionAccessor, NORMAL: normalAccessor, TEXCOORD_0: uvAccessor };
const gltf = {
  asset: { version: "2.0", generator: "LifeOS parametric body generator / MakeHuman CC0 assets" },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ name: "ParametricBody", mesh: 0 }],
  meshes: [{
    name: "HumanBody",
    weights: shapeDefinitions.map(() => 0),
    extras: { targetNames: shapeDefinitions.map(([name]) => name) },
    primitives: [
      { attributes, indices: skinIndexAccessor, material: 0, targets: morphAccessors },
      { attributes, indices: boxerIndexAccessor, material: 1, targets: morphAccessors },
    ],
  }],
  materials: [
    { name: "Skin", pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 0.72 }, doubleSided: false },
    { name: "BoxerBriefs", pbrMetallicRoughness: { baseColorFactor: [0.025, 0.032, 0.038, 1], metallicFactor: 0, roughnessFactor: 0.84 }, doubleSided: true },
  ],
  textures: [{ sampler: 0, source: 0 }],
  samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }],
  images: [{ name: "MakeHumanSkin", bufferView: imageBufferView, mimeType: "image/png" }],
  accessors,
  bufferViews,
  buffers: [{ byteLength: byteOffset }],
};

const json = Buffer.from(JSON.stringify(gltf));
const jsonPadding = (4 - (json.length % 4)) % 4;
const paddedJson = Buffer.concat([json, Buffer.alloc(jsonPadding, 0x20)]);
const bin = Buffer.concat(chunks);
const binPadding = (4 - (bin.length % 4)) % 4;
const paddedBin = Buffer.concat([bin, Buffer.alloc(binPadding)]);
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + paddedJson.length + 8 + paddedBin.length, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(paddedJson.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(paddedBin.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, Buffer.concat([header, jsonHeader, paddedJson, binHeader, paddedBin]));
console.log(JSON.stringify({ outputFile, vertices: basePositions.length, skinTriangles: skinTriangles.length, boxerTriangles: boxerTriangles.length, bytes: fs.statSync(outputFile).size }));
