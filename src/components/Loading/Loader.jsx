/* eslint-disable prettier/prettier */
import { Bars } from 'react-loader-spinner'

const Loader = () => {
  return (
    <div className="flex justify-center py-6">
      <Bars height={80} width={80} color="#042954" ariaLabel="bars-loading" visible={true} />
    </div>
  )
}

export default Loader
