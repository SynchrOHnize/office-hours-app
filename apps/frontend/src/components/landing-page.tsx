import NavBar from './navbar'
import wall_clock from '@/assets/wall-clock.jpg';
import { SignInButton, SignedOut } from '@clerk/clerk-react'
import { Button } from './ui/button'

const LandingPage = () => {
  const LoginButton = () => (
    <div>
      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl="/dashboard" signUpForceRedirectUrl='/dashboard'>
          <Button variant="outline" className='text-xl p-6 shadow-xl'>Start Now</Button>
        </SignInButton>
      </SignedOut>
    </div>
  )

  return (
    <div className="bg-slate-100">
      <NavBar isPublic={true} />
      <div className="min-h-screen text-black">
        <div className="grid md:grid-cols-2 grid-cols-1 min-h-screen">
          {/* Text Section */}
          <div className="flex items-center justify-center p-4 md:p-8">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                SYNC YOUR<br />OFFICE HOURS
              </h2>
              <h3 className="text-xl md:text-2xl mb-4 font-semibold">
                one dashboard. made simple.
              </h3>
              <LoginButton />
              <p className="mt-4 text-md text-gray-600 italic">
                <b>Note:</b> please log in with your @ufl.edu email.
              </p>
            </div>
          </div>

            <img
              src={wall_clock}
              alt="Clock On Wall"
              className="w-full h-full object-cover"
            />
        </div>
      </div>
    </div>
  )
}

export default LandingPage