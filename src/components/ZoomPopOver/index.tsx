import { FC } from 'react'
import './index.css'
interface IZoomPopOverProps {
  handleZoomInEnableToogle: () => void
  handleZoomOutEnableToogle: () => void
  handleZoomReset: () => void
}

const ZoomPopOver:FC<IZoomPopOverProps> = ({
  handleZoomInEnableToogle,
  handleZoomOutEnableToogle,
  handleZoomReset
}) => {
  return (
    <div className='zoom-popover'>
      <button onClick={handleZoomInEnableToogle}>
        <img src="./assets/zoom-in.svg" alt='Zoom In' />
        <span>Zoom in</span>
      </button>
      <button onClick={handleZoomOutEnableToogle}>
        <img src="./assets/zoom-out.svg" alt='Zoom Out' />
        <span>Zoom out</span>
      </button>
      <button onClick={handleZoomReset}>
        <img src="./assets/aspect-ratio.svg" alt='Zoom Out' className='mb-1' />
        <span>Reset</span>
      </button>
    </div>
  )
}

export default ZoomPopOver