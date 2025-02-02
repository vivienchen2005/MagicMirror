import { useState } from 'react'
import './App.css'
import Model from './components/Model.tsx'
import femaleSkin from './assets/female_skin.png'

function App() {
  const [color, setColor] = useState("#000000");

  return (
    <>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-16 h-10 border rounded"
      />
      <div className="flex justify-center items-center h-screen">
        {/* <ModelTest></ModelTest> */}
        <Model src={femaleSkin} color={color} maxWidth={750} maxHeight={750} />
      </div>
    </>
  )
}

export default App

