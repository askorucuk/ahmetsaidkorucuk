export type SceneState = {
  intro: number;
  cellBirth: number;
  cellAwake: number;
  neuronMorph: number;
  connectionGrow: number;
  networkForm: number;
  projectFocus: number;
  finale: number;
  activeProject: number;
  cameraZ: number;
  cameraY: number;
  cameraX: number;
  focusX: number;
  focusY: number;
  focusZ: number;
  dimNetwork: number;
  growthFront: number;
};

export const createSceneState = (): SceneState => ({
  intro: 1,
  cellBirth: 0,
  cellAwake: 0,
  neuronMorph: 0,
  connectionGrow: 0,
  networkForm: 0,
  projectFocus: 0,
  finale: 0,
  activeProject: -1,
  cameraZ: 14,
  cameraY: 1.3,
  cameraX: -0.25,
  focusX: 0,
  focusY: 0,
  focusZ: 0,
  dimNetwork: 0,
  growthFront: 0
});
