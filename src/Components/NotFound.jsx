import React from 'react'

const NotFound = () => {
  return (
    <>
      <div>
        <div className='flex flex-col justify-center items-center h-screen'>
            <h1 className='text-7xl font-bold mb-4'>404  Not Found</h1>
            <p className='mb-4'>your visited page not found,You may go to the HomePage</p>
            <button className='px-6 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 mt-8'>Back to home page</button>
        </div>
      </div>
    </>
  )
}

export default NotFound
