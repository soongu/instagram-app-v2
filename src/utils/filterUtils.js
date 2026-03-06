/**
 * Canvas API를 사용해 CSS filter를 이미지 픽셀에 직접 적용(굽기)한 뒤
 * 새로운 Blob을 반환합니다. 필터가 없으면 원본 File을 그대로 반환합니다.
 *
 * @param {File} file         - 원본 이미지 File 객체
 * @param {string} filterCss  - CSS filter 문자열 (예: 'grayscale(1) brightness(1.1)')
 * @returns {Promise<Blob>}   - 필터가 적용된 이미지 Blob
 */
export const applyFilterToFile = (file, filterCss) => {
  // 필터가 없으면 원본 그대로 반환
  if (!filterCss) return Promise.resolve(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      // CSS filter를 Canvas context에 적용
      ctx.filter = filterCss;
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      // 원본 MIME 타입 유지 (jpeg/webp 등), 품질 0.92
      const mimeType = file.type || 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob 실패'));
        },
        mimeType,
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`이미지 로드 실패: ${file.name}`));
    };

    img.src = url;
  });
};

/**
 * 파일 배열과 필터 배열을 받아 각 이미지에 필터를 굽힌 Blob 배열을 반환합니다.
 *
 * @param {File[]} files
 * @param {string[]} filterMap
 * @returns {Promise<Blob[]>}
 */
export const applyFiltersToFiles = (files, filterMap) => {
  return Promise.all(
    files.map((file, i) => applyFilterToFile(file, filterMap[i] || ''))
  );
};
