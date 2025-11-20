// Download Veo3 videos script (spawned as separate process)
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

const streamPipeline = promisify(pipeline);

async function downloadVideos() {
  try {
    // Parse command line args: node download-veo3-videos.js <outputDir> <url1> <url2> ...
    const args = process.argv.slice(2);

    if (args.length < 2) {
      console.error('Usage: node download-veo3-videos.js <outputDir> <videoUrl1> [videoUrl2] ...');
      process.exit(1);
    }

    const outputDir = args[0];
    const videoUrls = args.slice(1);

    console.log(`\n═══════════════════════════════════════════════════════════`);
    console.log(`📥 VEO3 VIDEO DOWNLOADER`);
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`📁 Output: ${outputDir}`);
    console.log(`📊 Videos: ${videoUrls.length}`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    // Create output directory if not exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✓ Created directory: ${outputDir}\n`);
    }

    let successCount = 0;
    let failCount = 0;

    // Download each video
    for (let i = 0; i < videoUrls.length; i++) {
      const videoUrl = videoUrls[i];
      const videoNumber = i + 1;
      const fileName = `video_${Date.now()}_${videoNumber}.mp4`;
      const filePath = path.join(outputDir, fileName);

      try {
        console.log(`[${videoNumber}/${videoUrls.length}] Downloading: ${fileName}...`);
        console.log(`   URL: ${videoUrl.substring(0, 80)}...`);

        // Download video (simple method like index.js)
        const response = await axios({
          method: 'GET',
          url: videoUrl,
          responseType: 'stream',
          timeout: 300000 // 5 minutes
        });

        // Stream to file
        await streamPipeline(response.data, fs.createWriteStream(filePath));

        // Get file size
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

        console.log(`   ✅ Saved: ${fileName} (${sizeMB} MB)\n`);
        successCount++;

      } catch (err) {
        console.error(`   ❌ Failed: ${err.message}\n`);
        failCount++;
      }
    }

    // Summary
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`🎉 DOWNLOAD COMPLETE`);
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`✅ Success: ${successCount}/${videoUrls.length}`);
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount}`);
    }
    console.log(`📁 Location: ${outputDir}`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    // Keep window open for 5 seconds
    console.log('Window will close in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (err) {
    console.error(`\n❌ Fatal error: ${err.message}`);
    process.exit(1);
  }
}

downloadVideos();
