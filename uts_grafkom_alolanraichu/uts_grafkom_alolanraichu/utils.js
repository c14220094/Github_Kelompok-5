function resizeCanvasToDisplaySize(canvas) {
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width  !== displayWidth || canvas.height !== displayHeight) {
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}

function transformAndColor(model, matrix, color) {
    const newModel = {
        ...model,
        vertices: [...model.vertices],
        normals: [...model.normals],
        colors: []
    };
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, matrix);
    mat4.transpose(normalMatrix, normalMatrix);
    for (let i = 0; i < newModel.vertices.length; i += 3) {
        const vec = vec3.transformMat4([], [newModel.vertices[i], newModel.vertices[i+1], newModel.vertices[i+2]], matrix);
        newModel.vertices[i] = vec[0];
        newModel.vertices[i+1] = vec[1];
        newModel.vertices[i+2] = vec[2];
        const norm = vec3.transformMat4([], [newModel.normals[i], newModel.normals[i+1], newModel.normals[i+2]], normalMatrix);
        vec3.normalize(norm, norm);
        newModel.normals[i] = norm[0];
        newModel.normals[i+1] = norm[1];
        newModel.normals[i+2] = norm[2];
        if (color) {
            newModel.colors.push(...color);
        } else {
            newModel.colors.push(model.colors[i], model.colors[i+1], model.colors[i+2]);
        }
    }
    return newModel;
}
