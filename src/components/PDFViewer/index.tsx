// @ts-nocheck
import { useEffect, FC, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import Notepad from '../Notepad';
import { NotesData } from '../../definitions/general';
import NoteView from '../NoteView';
import { useParams, useLocation } from 'react-router';
import { IndexedDBService } from '../../store/courses/indexedDBService';
import { Spin } from 'antd';
interface IPDFViewerProps {
  pdfData: string
  isNoteEnable: boolean
  isDrawEnabled: boolean
  setisNoteEnable: React.Dispatch<React.SetStateAction<boolean>>
  isZoomInEnable: boolean
  isZoomOutEnable: boolean
}

const PDFViewer: FC<IPDFViewerProps> = ({
  pdfData,
  isNoteEnable,
  isDrawEnabled,
  setisNoteEnable,
  isZoomInEnable,
  isZoomOutEnable
}) => {
  const location = useLocation();
  const params: { bundleId: string; lessonId: string; materialId: string } =
    useParams();
  const indexedDBService = new IndexedDBService();
  const [addNotesModal, setaddNotesModal] = useState(false)
  const [isAllPageRendered, setisAllPageRendered] = useState(false)
  const [notesData, setnotesData] = useState<Array<NotesData>>([])
  const [currentNoteCord, setcurrentNoteCord] = useState<Array<number>>([])
  const [currentNoteImgRef, setcurrentNoteImgRef] = useState<HTMLDivElement>()
  const [currentNotePage, setcurrentNotePage] = useState(0)
  const [isNoteViewOpen, setisNoteViewOpen] = useState(false)
  const [curOpenNoteData, setcurOpenNoteData] = useState<NotesData | null>()
  const [curNoteImage, setcurNoteImage] = useState<HTMLDivElement>()

  useEffect(() => {
    let containerEle = document.getElementById('canvas-pdf-container');
    setisAllPageRendered(false)
    // @ts-ignore
    containerEle.innerHTML = ''
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    handleInitialNoteFromDB()
    var loadingTask = pdfjsLib.getDocument({ data: atob(pdfData) });
    loadingTask.promise.then(async function (pdf) {
      const totalPageNumber = pdf.numPages
      for (let index = 1; index <= totalPageNumber; index++) {
        await printOnDom(pdf, index, containerEle, totalPageNumber)
      }
    }, function (reason) {
      // PDF loading error
    });
  }, [pdfData])

  useEffect(() => {
    if (isAllPageRendered) {
      if (notesData?.length) {
        notesData.forEach((item) => {
          handleNotesPrint(item)
        })
      }
    }
  }, [isAllPageRendered, notesData])

  useEffect(() => {
    if (isDrawEnabled) {
      // @ts-ignore
      document.getElementById("canvas-pdf-container").dataset.isDrawEnabled = 'true'
    } else {
      // @ts-ignore
      document.getElementById("canvas-pdf-container").dataset.isDrawEnabled = 'false'
    }
  }, [isDrawEnabled])

  useEffect(() => {
    if (isNoteEnable) {
      // @ts-ignore
      document.getElementById("canvas-pdf-container").dataset.isNoteEnable = 'true'
    } else {
      // @ts-ignore
      document.getElementById("canvas-pdf-container").dataset.isNoteEnable = 'false'
    }
  }, [isNoteEnable])

  useEffect(() => {
    if (isZoomInEnable) {
      // @ts-ignore
      document.getElementById("canvas-pdf-container").dataset.isZoomInEnable = 'true'
    } else {
      // @ts-ignore
      document.getElementById("canvas-pdf-container").dataset.isZoomInEnable = 'false'
    }
  }, [isZoomInEnable])

  useEffect(() => {
    if (isZoomOutEnable) {
      // @ts-ignore
      document.getElementById("canvas-pdf-container").dataset.isZoomOutEnable = 'true'
    } else {
      // @ts-ignore
      document.getElementById("canvas-pdf-container").dataset.isZoomOutEnable = 'false'
    }
  }, [isZoomOutEnable])

  const handleInitialNoteFromDB = () => {
    return new Promise((resolve, reject) => {
      indexedDBService.getNoteByBLM_id(`${params.bundleId}-${params.lessonId}-${params.materialId}`).then((res) => {
        setnotesData(res as NotesData[])
        resolve(1)
      }).catch(() => {
        reject(0)
      })
    }) 
  }

  let x = 0,
    y = 0;
  let isMouseDown = false;
  const stopDrawing = () => {
    isMouseDown = false;
  };

  const startDrawing = (event: MouseEvent) => {
    // @ts-ignore
    const isEnable = document.getElementById("canvas-pdf-container").dataset.isDrawEnabled;
    if (isEnable === 'true') {
      isMouseDown = true;
      [x, y] = [event.offsetX, event.offsetY];
    }
  };

  const drawLine = (event: MouseEvent, context: CanvasRenderingContext2D | null) => {
    if (isMouseDown) {
      const newX = event.offsetX;
      const newY = event.offsetY;
      context?.beginPath();
      context?.moveTo(x, y);
      context?.lineTo(newX, newY);
      context?.stroke();
      x = newX;
      y = newY;
    }
  };

  // const getCursorPosition = (event: MouseEvent, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D | null) => {
  //   stopDrawing();
  //   const rect = canvas.getBoundingClientRect();
  //   const x = event.clientX - rect.left;
  //   const y = event.clientY - rect.top;
  // };

  const handleAddNote = (event: MouseEvent, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null) => {
    // @ts-ignore
    const isNoteEnable = document.getElementById("canvas-pdf-container").dataset.isNoteEnable;
    // @ts-ignore
    const isZoomInEnableAttr = document.getElementById("canvas-pdf-container").dataset.isZoomInEnable;
    const isZoomOutEnableAttr = document.getElementById("canvas-pdf-container").dataset.isZoomOutEnable;
    if (isNoteEnable === 'true') {
      if (ctx) {
        const newX = event.offsetX;
        const newY = event.offsetY;
        let img = createImageEle(newY, newX)
        setcurNoteImage(img)
        const canvasEle = document.getElementById(`sub-container-page-${ctx.canvas.id.split('-')[1]}`)
        canvasEle?.appendChild(img)
        setisNoteEnable(false)
        setaddNotesModal(true)
        setcurrentNoteCord([newX, newY])
        setcurrentNoteImgRef(img)
        setcurrentNotePage(Number(ctx.canvas.id.split('-')[1]))
      }
    } else if (isZoomInEnableAttr === 'true') {
      handleAllPageZoom(true, ctx, event, canvas)
    } else if (isZoomOutEnableAttr === 'true') {
      handleAllPageZoom(false, ctx, event, canvas)
    }
  }

  // const handleIndivitualZoom = (isZoomin: boolean, ctx: CanvasRenderingContext2D | null, event: MouseEvent, canvas: HTMLCanvasElement) => {
  //   if (ctx) {
  //     var x = event.clientX - canvas.offsetLeft;
  //     var y = event.clientY - canvas.offsetTop;
  //     const containerEle = document.getElementById(`container-page-${ctx.canvas.id.split('-')[1]}`)
  //     let lastZoom = Number(containerEle?.style?.zoom.split('%')[0])
  //     if (lastZoom) {
  //       containerEle.style.zoom = isZoomin ? `${lastZoom + 10}%` : `${lastZoom - 10}%`
  //     } else {
  //       containerEle.style.zoom = isZoomin ? `110%` : `90%`
  //     }
  //     containerEle?.scroll(x, y)
  //   }
  // }

  const handleAllPageZoom = (isZoomin: boolean, ctx: CanvasRenderingContext2D | null, event: MouseEvent, canvas: HTMLCanvasElement) => {
    if (ctx) {
      var x = event.clientX - canvas.offsetLeft;
      var y = event.clientY - canvas.offsetTop;
      const containerEle = document.getElementsByClassName(`canvas-container`)
      for (let index = 0; index < containerEle.length; index++) {
        let lastZoom = Number(containerEle[index]?.style?.zoom.split('%')[0])
        if (lastZoom) {
          containerEle[index].style.zoom = isZoomin ? `${lastZoom + 10}%` : `${lastZoom - 10}%`
        } else {
          containerEle[index].style.zoom = isZoomin ? `110%` : `90%`
        }
        containerEle[index]?.scroll(x, y)
      }
      // if (Number(containerEle[0]?.style?.zoom.split('%')[0]) !== 100) {
      //   const notesEle = document.getElementsByClassName("note-image-container")
      //   for (let index = 0; index < notesEle.length; index++) {
      //     notesEle.item(index).style.display = 'none'
      //   }
      // } else {
      //   const notesEle = document.getElementsByClassName("note-image-container")
      //   for (let index = 0; index < notesEle.length; index++) {
      //     notesEle.item(index).style.display = 'flex'
      //   }
      // }
    }
  }

  const handleNoteClose = () => {
    setisNoteEnable(false)
    setaddNotesModal(false)
    setcurrentNoteCord([])
    setcurrentNoteImgRef(undefined)
    setcurrentNotePage(0)
    curNoteImage?.remove()
    setcurNoteImage(undefined)
  }

  const handleSubmitNote = (content: string) => {
    let data = notesData
    let newNote = {
      blm_id: `${params.bundleId}-${params.lessonId}-${params.materialId}`,
      page_number: currentNotePage,
      x_cord: currentNoteCord[0],
      y_cord: currentNoteCord[1],
      content: content,
    }
    indexedDBService.addNoteInDB(newNote).then((res)=> {
      newNote = {
        ...newNote,
        id: res
      }
      data?.push(newNote)
      setnotesData(data)
      currentNoteImgRef?.addEventListener('click', () => handleViewNote(newNote))
    })
    setisNoteEnable(false)
    setaddNotesModal(false)
    setcurrentNoteCord([])
    setcurrentNoteImgRef(undefined)
    setcurrentNotePage(0)
    setcurNoteImage(undefined)
  }

  const handleNotesPrint = (note: NotesData) => {
    const newX = note.x_cord;
    const newY = note.y_cord;
    const canvasEle = document.getElementById(`sub-container-page-${note.page_number}`)
    let img = createImageEle(newY, newX)
    img.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleViewNote(note)
    })
    canvasEle?.appendChild(img)
  }

  const createImageEle = (top: number, left: number) => {
    const noteImageContainerEle = document.createElement('div')
    noteImageContainerEle.setAttribute('class', 'note-image-container')
    const image = document.createElement('img')
    image.src = './assets/notes_yellow.svg';
    image.alt = 'notes'
    noteImageContainerEle.style.top = `${top}px`;
    noteImageContainerEle.style.left = `${left}px`;
    image.setAttribute('class', 'note-yellow')
    noteImageContainerEle.appendChild(image)
    return noteImageContainerEle
  }

  const handleViewNote = (note: NotesData) => {
    setcurOpenNoteData(note)
    setisNoteViewOpen(true)
  }

  const handleViewNoteClose = () => {
    setcurOpenNoteData(null)
    setisNoteViewOpen(false)
  }

  const printOnDom = async (pdf: PDFDocumentProxy, index: number, containerEle: HTMLElement | null, totalPageNumber: number) => {
    await pdf.getPage(index).then(function (page) {
      var scale = window.innerWidth === 1920 
                    ? 1.55 
                    : window.innerWidth === 1366
                    ? 1.1
                    : 1.21 
      const parentContainerWidth = containerEle?.offsetWidth
      if(parentContainerWidth < page.getViewport({ scale: 1 }).width) {
        scale = 1 - (page.getViewport({ scale: 1 }).width - parentContainerWidth) / page.getViewport({ scale: 1 }).width
      }
      var viewport = page.getViewport({ scale: scale });
      // Prepare canvas using PDF page dimensions
      var canvas = document.createElement('canvas')
      var canvasContainer = document.createElement('div')
      var canvasContainer2 = document.createElement('div')
      canvasContainer.setAttribute('class', 'canvas-container')
      canvasContainer.setAttribute('id', `container-page-${index}`)
      canvasContainer2.setAttribute('class', 'canvas-sub-container')
      canvasContainer2.setAttribute('id', `sub-container-page-${index}`)
      canvas.setAttribute("class", 'my-canvas')
      canvas.setAttribute("id", `page-${index}`)

      var context = canvas.getContext('2d');
      canvas.addEventListener("mousedown", (e) => startDrawing(e));
      canvas.addEventListener("mousemove", (e) => drawLine(e, context));
      canvas.addEventListener("mouseout", (e) => stopDrawing());
      canvas.addEventListener("mouseup", (e) => stopDrawing());
      canvas.addEventListener("click", (e) => {
        handleAddNote(e, canvas, context);
      });
      canvasContainer2.appendChild(canvas)
      canvasContainer.appendChild(canvasContainer2)
      containerEle?.appendChild(canvasContainer)
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderContext: any = {
        canvasContext: context,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
      });
      if (index === totalPageNumber) {
        setisAllPageRendered(true)
      }
    });
  }

  return (
    <div>
      {
        !isAllPageRendered &&
        <div className="h-[87vh] w-full flex justify-center items-center">
          <Spin spinning={!isAllPageRendered} size="large" ></Spin>
        </div>
      }
      <div
        id="canvas-pdf-container"
        style={{
          paddingBottom: '4rem',
          cursor:
            isDrawEnabled ? 'crosshair'
              : isNoteEnable ? 'context-menu'
                : isZoomInEnable ? 'zoom-in'
                  : isZoomOutEnable ? 'zoom-out'
                    : 'default'
        }}>
        {
          addNotesModal && <Notepad handleClose={handleNoteClose} handleSubmit={handleSubmitNote} />
        }
        {
          isNoteViewOpen && <NoteView content={curOpenNoteData} handleClose={handleViewNoteClose} handleInitialNoteFromDB={handleInitialNoteFromDB} />
        }
      </div>
    </div>
  )
}

export default PDFViewer