import { toJpeg } from 'html-to-image';

export async function captureElement(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    // For elements with scroll, we need to temporarily set height to its scrollHeight
    // to capture everything inside it.
    const originalStyle = element.style.cssText;
    
    // We check if it's a scrollable container
    const isScrollable = element.scrollHeight > element.clientHeight;
    
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      backgroundColor: '#fdebd0',
      skipAutoScale: true, // Prevent scaling down
      style: isScrollable ? {
          height: `${element.scrollHeight}px`,
          overflow: 'visible',
          position: 'static'
      } : {}
    });

    // Restore original styles
    element.style.cssText = originalStyle;
    
    const link = document.createElement('a');
    link.download = `${fileName}.jpg`;
    link.href = dataUrl;
    link.click();
    
    return dataUrl;
  } catch (error) {
    console.error('Failed to capture image:', error);
    return null;
  }
}

export async function shareImages(dataUrls: string[], text: string) {
  if (navigator.share && navigator.canShare) {
    try {
      const files: File[] = [];
      for (let i = 0; i < dataUrls.length; i++) {
        const response = await fetch(dataUrls[i]);
        const blob = await response.blob();
        files.push(new File([blob], `pantry-${i}.jpg`, { type: 'image/jpeg' }));
      }

      if (navigator.canShare({ files })) {
        await navigator.share({
          files,
          title: 'My Cozy Pantry',
          text: text,
        });
        return true;
      }
    } catch (e) {
      console.warn('Sharing failed', e);
    }
  }
  return false;
}
