;(function() {
  // 1) Ambil elemen canvas
  const canvas = document.getElementById("renderCanvas");

  // 2) Init engine, non-aktifkan Uniform Buffers
  const engine = new BABYLON.Engine(
    canvas,
    true,
    { disableUniformBuffers: true },
    true
  );

  // 3) Buat scene + AR + hit-test
  async function createScene() {
    const scene = new BABYLON.Scene(engine);
    new BABYLON.HemisphericLight("light", BABYLON.Vector3.Up(), scene);

    // Buat cube ukuran 20 cm
    const box = BABYLON.MeshBuilder.CreateBox("cube", { size: 0.2 }, scene);

    // Inisialisasi XR immersive-ar dengan hit-test
    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: { sessionMode: "immersive-ar" },
      requiredFeatures: ["hit-test"]
    });

    // Aktifkan fitur hit-test
    const hitTest = xr.baseExperience.featuresManager.enableFeature(
      "xr-hit-test",   // string konstanta v8+
      "latest",
      {
        // opsi: ray dari 1 m di atas, turun ke bawah
        offsetRay: new BABYLON.Ray(
          new BABYLON.Vector3(0, 1, 0),
          new BABYLON.Vector3(0, -1, 0)
        )
      }
    );

    // Tangani hasil hit-test tiap frame
    hitTest.onHitTestResultObservable.add((results) => {
      const hit = results[0];
      if (!hit) return;

      const m = hit.transformationMatrix;            // Array 16 elemen
      box.position.set(m[12], m[13], m[14]);          // elemen 12–14 = posisi
      box.rotationQuaternion = BABYLON.Quaternion
        .FromRotationMatrix(BABYLON.Matrix.FromArray(m));
    });

    return scene;
  }

  // 4) Jalankan render-loop
  createScene().then((scene) => {
    engine.runRenderLoop(() => scene.render());
  });

  // 5) Resize handling
  window.addEventListener("resize", () => engine.resize());
})();
