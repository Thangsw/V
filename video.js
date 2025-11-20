// video.js
// Orchestrator – supports passing local File(s).
// If you pass File objects, it will crop+upload them to get mediaId automatically.

import { VideoVeo3 } from "./video-veo3.js";

const VideoOrchestrator = (() => {

  /**
   * Start a generation job according to available inputs.
   * Args can include either mediaIds OR Files. If Files are present, they are uploaded first.
   *
   * @param {{
   *   prompt?: string,
   *   // Provide either mediaId or File for start/end anchor:
   *   startImageMediaId?: string,
   *   endImageMediaId?: string,
   *   startImageFile?: File,
   *   endImageFile?: File,
   *   // For batch local upload you can supply imageFiles: File[]
   *   imageFiles?: File[],
   *
   *   projectId?: string,
   *   sceneId?: string,
   *   aspectRatio?: "VIDEO_ASPECT_RATIO_LANDSCAPE"|"VIDEO_ASPECT_RATIO_PORTRAIT"|"VIDEO_ASPECT_RATIO_SQUARE",
   *   durationSec?: number,
   *   seed?: number,
   *   previousMediaGenerationId?: string,
   *   textToVideo?: boolean,
   *   textSeeds?: number[],
   *   textSceneIds?: string[]
   * }} args
   */
  async function startJob(args) {
    const {
      previousMediaGenerationId,
      textToVideo,
      textSeeds,
      textSceneIds,
      prompt,
      startImageMediaId,
      endImageMediaId,
      startImageFile,
      endImageFile,
      imageFiles,
      projectId,
      sceneId,
      aspectRatio = "VIDEO_ASPECT_RATIO_LANDSCAPE",
      durationSec = 8,
      seed = 0
    } = args;

    // 1) Extend
    if (previousMediaGenerationId) {
      return VideoVeo3.extendFlow({ previousMediaGenerationId, prompt, additionalDurationSec: durationSec });
    }

    // 2) If text-only explicitly or no anchors at all
    const noAnchorsProvided = !startImageMediaId && !endImageMediaId && !startImageFile && !endImageFile && !(imageFiles?.length);
    if (textToVideo || noAnchorsProvided) {
      console.log('Text-to-video mode');
      return VideoVeo3.textToVideoFlow({
        projectId,
        prompt,
        aspectRatio,
        seeds: textSeeds && textSeeds.length ? textSeeds : [seed, seed + 1234],
        sceneIds: textSceneIds
      });
    }

    // 3) Prepare anchors: if Files provided, upload them to get mediaIds.
    let startId = startImageMediaId || null;
    let endId = endImageMediaId || null;

    if (startImageFile) {
      const u = await VideoVeo3.fileToMediaId(startImageFile, aspectRatio);
      startId = u.mediaId;
    }
    if (endImageFile) {
      const u = await VideoVeo3.fileToMediaId(endImageFile, aspectRatio);
      endId = u.mediaId;
    }
    // If batch files provided (imageFiles), take the first two for start/end
    if ((!startId || !endId) && imageFiles && imageFiles.length) {
      const uploaded = await VideoVeo3.filesToMediaIds(imageFiles, aspectRatio);
      if (!startId && uploaded[0]) startId = uploaded[0].mediaId;
      if (!endId   && uploaded[1]) endId   = uploaded[1].mediaId;
    }

    return VideoVeo3.startEndFlow({
      prompt,
      startImageMediaId: startId || undefined,
      endImageMediaId:   endId   || undefined,
      aspectRatio,
      durationSec,
      seed,
      projectId,
      sceneId
    });
  }

  function poll(opId, options) {
    return VideoVeo3.pollOperation(opId, options);
  }

  function updateSceneClips({ projectId, sceneId, clips }) {
    return VideoVeo3.updateSceneClips({ projectId, sceneId, clips });
  }

  return { startJob, poll, updateSceneClips };
})();

export { VideoOrchestrator };
