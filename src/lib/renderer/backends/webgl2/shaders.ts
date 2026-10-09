/**
 * One program draws everything: a unit quad, placed by a 3×3 matrix that already ends in
 * clip space, sampling a sub-rectangle of a premultiplied-alpha texture.
 */

export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
uniform mat3 u_matrix;
uniform vec4 u_crop;
out vec2 v_uv;

void main() {
  vec3 clip = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(clip.xy, 0.0, 1.0);
  v_uv = u_crop.xy + a_position * u_crop.zw;
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_texture;
uniform float u_opacity;
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_uv) * u_opacity;
}
`;
