/**
 * TensorFlow.js Model Training Script for Malaria Detection
 * Trains a CNN on the cell_images dataset (27,560 images)
 * Binary Classification: Parasitized vs Uninfected
 */

// Polyfill for deprecated util.isNullOrUndefined (removed in Node.js 12+)
// Required for tfjs-node compatibility with newer Node versions
import util from 'util';
if (!util.isNullOrUndefined) {
  util.isNullOrUndefined = (val) => val === null || val === undefined;
}

import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  imageSize: 128, // Resize images to 128x128 (faster than 224x224)
  batchSize: 32,
  epochs: 15,
  validationSplit: 0.2,
  modelSavePath: 'file://./public/models/malaria-detection',
  datasetPath: './cell_images',
  maxImagesPerClass: 5000 // Limit for faster training (use null for all images)
};

console.log('🧠 Malaria Detection Model Training');
console.log('====================================');
console.log(`Dataset: ${CONFIG.datasetPath}`);
console.log(`Image Size: ${CONFIG.imageSize}x${CONFIG.imageSize}`);
console.log(`Batch Size: ${CONFIG.batchSize}`);
console.log(`Epochs: ${CONFIG.epochs}`);
console.log('');

/**
 * Load and preprocess images from a directory
 */
async function loadImages(dirPath, label) {
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
    .slice(0, CONFIG.maxImagesPerClass || undefined);
  
  console.log(`📂 Loading ${files.length} images from ${path.basename(dirPath)}...`);
  
  const images = [];
  const labels = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    if (i % 500 === 0 && i > 0) {
      console.log(`   Progress: ${successCount} loaded, ${errorCount} errors (${i}/${files.length})`);
    }
    
    try {
      const filePath = path.join(dirPath, files[i]);
      
      // Load and process image using sharp
      const imageBuffer = await sharp(filePath)
        .resize(CONFIG.imageSize, CONFIG.imageSize)
        .removeAlpha() // Convert RGBA to RGB
        .raw() // Get raw pixel data
        .toBuffer();
      
      // Convert buffer to Float32Array and normalize to [0, 1]
      const numPixels = CONFIG.imageSize * CONFIG.imageSize * 3;
      const normalizedData = new Float32Array(numPixels);
      
      for (let j = 0; j < numPixels; j++) {
        normalizedData[j] = imageBuffer[j] / 255.0;
      }
      
      // Create tensor with proper shape
      const imageTensor = tf.tensor3d(
        normalizedData,
        [CONFIG.imageSize, CONFIG.imageSize, 3],
        'float32'
      );
      
      images.push(imageTensor);
      labels.push(label);
      successCount++;
      
    } catch (error) {
      errorCount++;
      if (errorCount <= 5) {
        console.error(`   Error loading ${files[i]}: ${error.message}`);
      }
    }
  }
  
  console.log(`✅ Loaded ${successCount} images from ${path.basename(dirPath)} (${errorCount} errors)`);
  return { images, labels };
}

/**
 * Create CNN model architecture
 */
function createModel() {
  const model = tf.sequential();
  
  // Input layer: 128x128x3 RGB images
  model.add(tf.layers.conv2d({
    inputShape: [CONFIG.imageSize, CONFIG.imageSize, 3],
    filters: 32,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same'
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(tf.layers.dropout({ rate: 0.25 }));
  
  // Second convolutional block
  model.add(tf.layers.conv2d({
    filters: 64,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same'
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(tf.layers.dropout({ rate: 0.25 }));
  
  // Third convolutional block
  model.add(tf.layers.conv2d({
    filters: 128,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same'
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(tf.layers.dropout({ rate: 0.25 }));
  
  // Flatten and dense layers
  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.5 }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); // Binary classification
  
  // Compile model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });
  
  console.log('🏗️  Model Architecture:');
  model.summary();
  
  return model;
}

/**
 * Main training function
 */
async function trainModel() {
  try {
    console.log('\n📊 Step 1: Loading Dataset');
    console.log('==========================\n');
    
    // Load parasitized images (label = 1)
    const parasitizedData = await loadImages(
      path.join(CONFIG.datasetPath, 'Parasitized'),
      1
    );
    
    // Load uninfected images (label = 0)
    const uninfectedData = await loadImages(
      path.join(CONFIG.datasetPath, 'Uninfected'),
      0
    );
    
    // Combine datasets
    const allImages = [...parasitizedData.images, ...uninfectedData.images];
    const allLabels = [...parasitizedData.labels, ...uninfectedData.labels];
    
    console.log(`\n✅ Total dataset: ${allImages.length} images`);
    console.log(`   - Parasitized: ${parasitizedData.images.length}`);
    console.log(`   - Uninfected: ${uninfectedData.images.length}`);
    
    // Validate we have enough data
    if (allImages.length === 0) {
      throw new Error('No images were loaded! Check dataset path and image files.');
    }
    if (allImages.length < 100) {
      throw new Error(`Only ${allImages.length} images loaded. Need at least 100 images to train.`);
    }
    
    // Convert to tensors
    console.log('\n🔄 Converting to tensors...');
    
    // Instead of tf.stack(), manually create a 4D tensor
    // Concatenate all image data into a single Float32Array
    const batchSize = allImages.length;
    const imageSize = CONFIG.imageSize;
    const channels = 3;
    const totalElements = batchSize * imageSize * imageSize * channels;
    
    const allImageData = new Float32Array(totalElements);
    
    console.log('   Concatenating image tensors...');
    for (let i = 0; i < batchSize; i++) {
      const imageData = allImages[i].dataSync();
      const offset = i * imageSize * imageSize * channels;
      allImageData.set(imageData, offset);
      
      // Dispose individual tensor to free memory
      allImages[i].dispose();
    }
    
    // Create batched tensor
    const xs = tf.tensor4d(allImageData, [batchSize, imageSize, imageSize, channels]);
    const ys = tf.tensor2d(allLabels, [allLabels.length, 1]);
    
    console.log(`   Input shape: ${xs.shape}`);
    console.log(`   Output shape: ${ys.shape}`);
    
    console.log('\n🏗️  Step 2: Creating Model');
    console.log('===========================\n');
    const model = createModel();
    
    console.log('\n🎯 Step 3: Training Model');
    console.log('==========================\n');
    console.log('Training will take several minutes. Please wait...\n');
    
    const startTime = Date.now();
    
    await model.fit(xs, ys, {
      batchSize: CONFIG.batchSize,
      epochs: CONFIG.epochs,
      validationSplit: CONFIG.validationSplit,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
          console.log(
            `Epoch ${epoch + 1}/${CONFIG.epochs} - ` +
            `Loss: ${logs.loss.toFixed(4)}, ` +
            `Acc: ${(logs.acc * 100).toFixed(2)}%, ` +
            `Val Loss: ${logs.val_loss.toFixed(4)}, ` +
            `Val Acc: ${(logs.val_acc * 100).toFixed(2)}% ` +
            `(${elapsed}s)`
          );
        }
      }
    });
    
    const trainingTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log(`\n✅ Training completed in ${trainingTime} minutes!`);
    
    console.log('\n💾 Step 4: Saving Model');
    console.log('=======================\n');
    
    // Create directory if it doesn't exist
    const modelDir = path.join(__dirname, 'public', 'models');
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }
    
    await model.save(CONFIG.modelSavePath);
    console.log(`✅ Model saved to: ${CONFIG.modelSavePath}`);
    
    // Clean up
    xs.dispose();
    ys.dispose();
    model.dispose();
    
    console.log('\n🎉 Training Complete!');
    console.log('===================');
    console.log('You can now use the trained model in your application.');
    console.log('The model has been saved to: public/models/malaria-detection/');
    
  } catch (error) {
    console.error('\n❌ Training failed:', error);
    throw error;
  }
}

// Run training
trainModel().catch(console.error);
