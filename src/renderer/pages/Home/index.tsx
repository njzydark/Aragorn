import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AppContext } from '@/renderer/app';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';

export default function Home() {
  const { images } = useContext(AppContext);
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  useEffect(() => {
    document.title = 'Aragon';
  }, []);

  const openLightbox = useCallback((_, { index }) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  return (
    <div className="home-wrapper">
      <Gallery photos={images as any} onClick={openLightbox} />
      <ModalGateway>
        {viewerIsOpen ? (
          <Modal onClose={closeLightbox}>
            <Carousel
              currentIndex={currentImage}
              views={(images as any).map(x => ({
                ...x,
                source: x.src
              }))}
            />
          </Modal>
        ) : null}
      </ModalGateway>
    </div>
  );
}
