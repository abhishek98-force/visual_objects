import { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createPortal } from 'react-dom';
import Button from 'react-bootstrap/Button';

import './App.css';
import ModalContent from './components/ModelContent';

function App() {
  const noImageUrl = '../public/image.png';
  const canvasRef = useRef(null);
  const [image, setImage] = useState(noImageUrl);
  const [updateCanvas, setUpdateCanvas] = useState(false);
  const [base64Image, setbase64ImageData] = useState('');
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [rectangles, setRectangles] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [inputCordinate, setInputCordinate] = useState({ x: 0, y: 0 });
  const [inputTextValue, setInputTextValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRectangle, setSelectedRectangle] = useState(null);
  const [imageBound, setImageBound] = useState(null);
  const [imageBound1, setImageBound1] = useState(null);

  function uploadFile(event) {
    console.log(event.target.files[0]);
    let canvas = document.querySelector('.ImageHolder');
    setImageBound1({
      x: canvas.getBoundingClientRect().left,
      y: canvas.getBoundingClientRect().top,
    });
    setImage(event.target.files[0]);
  }

  const handleLabel = (id) => (labelVal) => {
    const updatedRectangles = rectangles.map((rectangle) => {
      if (rectangle.id === id) {
        return { ...rectangle, objectType: labelVal };
      } else {
        return rectangle;
      }
    });
    const data = {
      id: id,
      label: labelVal,
    };
    fetch('http://localhost:5000/api/label_modify', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    setRectangles(updatedRectangles);
    setShowModal(false);
    setShowInput(true);
  };

  function handleInputLabelChange(event) {
    console.log(event.target.value);
  }

  useEffect(() => {
    if (image !== noImageUrl && rectangles == null) {
      drawImage();
    }
    if (rectangles !== null) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = 'red';
      rectangles.forEach((item) => {
        ctx.strokeRect(item.x, item.y, item.width, item.height);
      });
      setIsButtonDisabled(true);
    }
  }, [image, rectangles]);

  function convertImageToBase64() {
    const canvas = canvasRef.current;
    const base64ImageData = canvas.toDataURL('image/jpg');
    const base64String = base64ImageData.split(',')[1];
    setbase64ImageData(base64String);
    console.log('data is' + base64String);
  }

  function drawImage() {
    const file = image;
    console.log('file is' + file);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Clear the canvas
        canvas.width = 716;
        canvas.height = 411;
        console.log('Width of canvas is' + canvas.width + 'x' + canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setIsImageUploaded(true);
        convertImageToBase64();
      };
    };
    reader.readAsDataURL(file);
  }

  function handleCanvasClick(event) {
    console.log('canvas clicked');
    const rect = event.target.getBoundingClientRect();
    setImageBound({ x: rect.left, y: top.rect });
    const clickedX = event.clientX - rect.left;
    const clickedY = event.clientY - rect.top;

    const rectObj = rectangles.find((rectangle) => {
      return (
        clickedX >= rectangle.x &&
        clickedX < rectangle.x + rectangle.width &&
        clickedY >= rectangle.y &&
        clickedY < rectangle.y + rectangle.height
      );
    });
    setSelectedRectangle(rectObj);
    setShowModal(true);

    console.log(rectObj);
    setInputCordinate({ x: rect.left + rectObj.x, y: rect.top + rectObj.y });
  }

  function dowloadAndSaveImage() {}

  function drawCircle() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
  }
  // post api request to send the image to backend
  //get api request to get the array of rectangle coordinates to display
  // put api to update the label of the seleced rectang;e
  async function drawRec() {
    await fetchRectangleData();

    // ctx.strokeRect(250, 80, 20, 20);
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = 'red';
    // ctx.font = '20px Arial';
    // ctx.fillStyle = 'red';
    console.log('Rectangle ' + rectangles);
  }

  function closeModal() {
    setShowModal(false);
  }

  async function fetchRectangleData() {
    let postData = {
      image_url: base64Image,
    };
    console.log('image data is ' + postData);
    fetch('http://localhost:5000/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => setRectangles(data))
      .catch((error) => console.log('Error: ' + error));
  }

  return (
    <div
      className="App"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div className="ImageHolder" style={{ width: '716px', height: '411px' }}>
        {/* <img
          src={image}
          alt="missing image"
          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
        /> */}

        <canvas
          ref={canvasRef}
          style={{
            border: '1px solid black',
            width: '716px',
            height: '411px',
            display: isImageUploaded ? 'block' : 'none',
          }}
          onClick={handleCanvasClick}
        />

        {rectangles &&
          rectangles.map((rectangle, index) => {
            return (
              <output
                key={index}
                style={{
                  position: 'absolute',
                  top: `${imageBound1.y + rectangle.y}px`,
                  left: `${imageBound1.x + rectangle.x}px`,
                  color: 'red',
                  zIndex: 100,
                }}
              >
                {rectangle.objectType}
              </output>
            );
          })}

        <img
          src={noImageUrl}
          alt="missing image"
          style={{
            objectFit: 'cover',
            height: '100%',
            width: '100%',
            display: isImageUploaded === false ? 'block' : 'none',
          }}
        />
      </div>
      {showModal &&
        selectedRectangle &&
        createPortal(
          <ModalContent
            onClose={closeModal}
            sendLabelToApp={handleLabel(selectedRectangle.id)}
          />,
          document.body
        )}
      <div
        className="buttonGroup"
        style={{ marginTop: '30px', display: 'flex', flexDirection: 'row' }}
      >
        <Button variant="dark">
          <input type="file" onChange={uploadFile} />
        </Button>
        &nbsp; &nbsp; &nbsp;
        <Button variant="dark" onClick={drawRec} disabled={isButtonDisabled}>
          Detect
        </Button>
      </div>
    </div>
  );
}

export default App;
