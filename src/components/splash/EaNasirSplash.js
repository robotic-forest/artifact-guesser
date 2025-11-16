import { Button } from "../buttons/Button"
import { FaArrowRight } from "react-icons/fa"
import { useState } from "react"

export const EaNasirSplash = ({ startGame }) => {
  const [step, setStep] = useState(0)

  return (
    <div
      className="fixed inset-0 flex items-start md:items-center justify-center w-full h-full"
      style={{ 
        background: 'linear-gradient(to bottom, #dfbf9e,rgb(120, 88, 55))' 
      }}
    >
      <div className="flex items-center justify-around p-8 flex-col md:flex-row pt-24 md:pt-8">
        {/* Left side text */}
        <div className="text-center font-[serif] md:w-[calc(50vw-16px)] relative md:right-[-10%] z-10">
          {step === 0 && (
            <h1 className="text-5xl md-text-[64px] font-bold text-black text-center leading-[1]">
              <i className='inline-block mb-8'>Oh no!</i><br/>You <br/>have been<br/>
              <span className='inline-block my-8 font-bold font-[impact] tracking-widest'>BAMBOOZLED</span>
              <br/>by<br/> <i className='inline-block mt-4'>Ea Nasir</i>!
            </h1>
          )}
          {step === 1 && (
            <h1 className="text-5xl font-bold text-black text-center leading-[1.4]">
              <i className='inline-block mb-8'>Never again!</i>
              <br/>
              Consider this <br/>your <i>training ground</i><br/>to discern
              <br/><i className='font-mono mt-4 inline-block'>✨ good quality copper ✨</i>
            </h1>
          )}
          <Button
            className="mt-12"
            onClick={() => {
              if (!step) setStep(step + 1)
              else startGame()
            }}
            css={{
              color: '#000000',
              background: '#dfbf9e',
              '&:hover': {
                color: '#000000',
                background: 'rgb(205, 171, 137)',
              },
              border: '1px outset',
              borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
              boxShadow: 'none',
              borderRadius: 0,
              padding: '4px 24px',
              minWidth: '40px',
              textAlign: 'center',
              fontSize: '2em',
              fontFamily: 'monospace'
            }}
          >
            {!step ? 'Next' : 'Start Game'}
            <FaArrowRight className="inline-block mr-2 text-[20px] ml-4" />
          </Button>
        </div>

        {/* Right side image */}
        <div className="flex justify-center w-[80vw] max-w-[400px] max-h-screen md:max-w-full md:w-[calc(50vw-16px)] fixed md:relative bottom-0">
          <img
            src="ea-nasir.png"
            alt="Ea-Nasir"
            css={{
              display: 'block',
              '@media (max-width: 767px)': {
                display: 'none',
              },
              objectFit: 'contain',
              width: '100%',
              height: 'auto',
              position: 'relative',
              left: '-10%',
              transform: 'scaleX(-1)',
            }}
          />
          <img
            src='ea-nasir-cropped.png'
            alt="Ea-Nasir"
            css={{
              display: 'none',
              '@media (max-width: 767px)': {
                display: 'block',
              },
              objectFit: 'contain',
              width: '100%',
              height: 'auto',
              position: 'relative',
              left: 0,
              transform: 'scaleX(-1)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
