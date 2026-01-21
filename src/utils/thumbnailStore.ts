declare const window: any;

export const loadThumbnails = async (videos: Record<string, any>[]) => {
  const promises = [] as Promise<void>[];
  videos.forEach((d: any, i: number) => {
    const shouldLoadBase64 = !d.vid_thumb.startsWith("https") && !d.vid_thumb.startsWith("data:image/")
    if (shouldLoadBase64) {
      promises.push(
        new Promise((resolve, reject) =>
          window.api.requestThumbContent(`${d.vid_thumb}`, (arg: any) => {
            resolve((videos[i].vid_thumb = arg));
          })
        )
      );
    } else {
      promises.push(videos[i].vid_thumb = d.vid_thumb);
    }
  });

  return new Promise((resolve, reject) => {
    Promise.all(promises).then(() => {
      return resolve(videos);
    })
  })
}
