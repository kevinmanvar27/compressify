export const bytesToSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes === 0) return "0 Byte";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${sizes[i]}`;
};

export const calculateBlobSize = (blob?: Blob): string => {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];

  let size = blob?.size || 0;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const reduceSize = (
  bytes: number,
  blob?: Blob
): { sizeReduced: string; percentage: string } => {
  const blobSizeInBytes = blob?.size || 0;

  // Guard: if original size is 0 or blob is missing, return zeroes
  if (bytes <= 0 || blobSizeInBytes <= 0) {
    return { sizeReduced: "0 Byte", percentage: "0.00" };
  }

  const adjustedSizeInBytes = Math.max(0, bytes - blobSizeInBytes);
  // Percentage of the original that was removed (0–100)
  const percentageReduction = ((adjustedSizeInBytes / bytes) * 100).toFixed(2);

  return {
    sizeReduced: bytesToSize(adjustedSizeInBytes),
    percentage: percentageReduction,
  };
};
