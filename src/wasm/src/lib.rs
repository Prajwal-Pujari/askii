use wasm_bindgen::prelude::*;

const ASCII_CHARS: &[u8] = b" .:-=+*#%@";
const ASCII_DETAILED: &[u8] = b" .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

#[wasm_bindgen]
pub struct ProcessedFrame {
    chars: Vec<u8>,
    colors: Vec<u8>, // RGB triplets [r,g,b,r,g,b,...]
}

#[wasm_bindgen]
impl ProcessedFrame {
    pub fn chars(&self) -> Vec<u8> {
        self.chars.clone()
    }

    pub fn colors(&self) -> Vec<u8> {
        self.colors.clone()
    }
}

#[wasm_bindgen]
pub fn process_frame_with_color(
    rgba_buffer: &[u8],
    width: usize,
    height: usize,
    block_size: usize,
    use_detailed_chars: bool,
) -> ProcessedFrame {
    let grid_width = width / block_size;
    let grid_height = height / block_size;
    let mut chars = Vec::with_capacity(grid_width * grid_height);
    let mut colors = Vec::with_capacity(grid_width * grid_height * 3);

    let ascii_set = if use_detailed_chars {
        ASCII_DETAILED
    } else {
        ASCII_CHARS
    };

    let pixels_per_block = block_size * block_size;

    for grid_y in 0..grid_height {
        for grid_x in 0..grid_width {
            let start_x = grid_x * block_size;
            let start_y = grid_y * block_size;
            let end_x = (start_x + block_size).min(width);
            let end_y = (start_y + block_size).min(height);

            let mut sum_gray: u32 = 0;
            let mut sum_r: u32 = 0;
            let mut sum_g: u32 = 0;
            let mut sum_b: u32 = 0;
            let mut count: u32 = 0;

            // Optimized inner loop with better memory access pattern
            for y in start_y..end_y {
                let row_start = y * width * 4;
                for x in start_x..end_x {
                    let idx = row_start + x * 4;
                    
                    // Bounds check once per pixel
                    if idx + 3 < rgba_buffer.len() {
                        // Load values once
                        let r = rgba_buffer[idx] as u32;
                        let g = rgba_buffer[idx + 1] as u32;
                        let b = rgba_buffer[idx + 2] as u32;

                        sum_r += r;
                        sum_g += g;
                        sum_b += b;
                        
                        // Optimized grayscale calculation (approximation)
                        sum_gray += (r * 3 + g * 6 + b) / 10;
                        count += 1;
                    }
                }
            }

            if count > 0 {
                let avg_gray = (sum_gray / count).min(255) as u8;
                let avg_r = (sum_r / count).min(255) as u8;
                let avg_g = (sum_g / count).min(255) as u8;
                let avg_b = (sum_b / count).min(255) as u8;

                // Select ASCII character with bounds check
                let char_index = ((avg_gray as usize) * (ascii_set.len() - 1)) / 255;
                chars.push(ascii_set[char_index.min(ascii_set.len() - 1)]);

                // Store RGB color
                colors.push(avg_r);
                colors.push(avg_g);
                colors.push(avg_b);
            } else {
                chars.push(b' ');
                colors.push(0);
                colors.push(0);
                colors.push(0);
            }
        }
    }

    ProcessedFrame { chars, colors }
}

#[wasm_bindgen]
pub fn apply_edge_detection(
    rgba_buffer: &[u8],
    width: usize,
    height: usize,
    block_size: usize,
) -> Vec<u8> {
    let grid_width = width / block_size;
    let grid_height = height / block_size;
    let mut result = Vec::with_capacity(grid_width * grid_height);

    // Sobel kernels
    let sobel_x: [[i32; 3]; 3] = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
];

let sobel_y: [[i32; 3]; 3] = [
    [-1, -2, -1],
    [ 0,  0,  0],
    [ 1,  2,  1],
];

    for grid_y in 0..grid_height {
        for grid_x in 0..grid_width {
            let center_x = grid_x * block_size + block_size / 2;
            let center_y = grid_y * block_size + block_size / 2;

            let mut gx: i32 = 0;
            let mut gy: i32 = 0;

            // Apply Sobel operator
            for ky in 0usize..3 {
                for kx in 0usize..3 {
                    let px = (center_x as i32 + ky as i32 - 1)
                        .max(0)
                        .min((width - 1) as i32) as usize;

                    let py = (center_y as i32 + kx as i32 - 1)
                        .max(0)
                        .min((height - 1) as i32) as usize;

                    let idx = (py * width + px) * 4;

                    if idx + 2 < rgba_buffer.len() {
                        let r = rgba_buffer[idx] as i32;
                        let g = rgba_buffer[idx + 1] as i32;
                        let b = rgba_buffer[idx + 2] as i32;
                        let gray = (299 * r + 587 * g + 114 * b) / 1000;

                        gx += gray * sobel_x[ky][kx];
                        gy += gray * sobel_y[ky][kx];
                    }
                }
            }


            let magnitude = ((gx * gx + gy * gy) as f64).sqrt() as u8;
            let char_index = ((magnitude as usize) * (ASCII_CHARS.len() - 1)) / 255;
            result.push(ASCII_CHARS[char_index]);
        }
    }

    result
}

#[wasm_bindgen]
pub fn apply_contrast(
    rgba_buffer: &[u8],
    width: usize,
    height: usize,
    contrast_factor: f32,
) -> Vec<u8> {
    let mut result = Vec::with_capacity(rgba_buffer.len());
    let factor = (259.0 * (contrast_factor + 255.0)) / (255.0 * (259.0 - contrast_factor));

    for i in (0..rgba_buffer.len()).step_by(4) {
        let r = ((factor * (rgba_buffer[i] as f32 - 128.0) + 128.0).max(0.0).min(255.0)) as u8;
        let g = ((factor * (rgba_buffer[i + 1] as f32 - 128.0) + 128.0).max(0.0).min(255.0)) as u8;
        let b = ((factor * (rgba_buffer[i + 2] as f32 - 128.0) + 128.0).max(0.0).min(255.0)) as u8;

        result.push(r);
        result.push(g);
        result.push(b);
        result.push(rgba_buffer[i + 3]); // Alpha
    }

    result
}

#[wasm_bindgen]
pub fn process_frame(
    grayscale_buffer: &[u8],
    width: usize,
    height: usize,
    block_size: usize,
) -> Vec<u8> {
    let grid_width = width / block_size;
    let grid_height = height / block_size;
    let mut result = Vec::with_capacity(grid_width * grid_height);

    for grid_y in 0..grid_height {
        for grid_x in 0..grid_width {
            let mut sum: u32 = 0;
            let mut count: u32 = 0;

            let start_x = grid_x * block_size;
            let start_y = grid_y * block_size;
            let end_x = (start_x + block_size).min(width);
            let end_y = (start_y + block_size).min(height);

            for y in start_y..end_y {
                for x in start_x..end_x {
                    let idx = y * width + x;
                    if idx < grayscale_buffer.len() {
                        sum += grayscale_buffer[idx] as u32;
                        count += 1;
                    }
                }
            }

            let avg_brightness = if count > 0 {
                (sum / count) as u8
            } else {
                0
            };

            let char_index = ((avg_brightness as usize) * (ASCII_CHARS.len() - 1)) / 255;
            result.push(ASCII_CHARS[char_index]);
        }
    }

    result
}