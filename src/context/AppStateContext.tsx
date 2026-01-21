
import { createContext, FC, ReactNode, useState } from 'react'

interface IAppStateContextStore {
  children: ReactNode
}

type AppStateContextType = {
  courseDownloadLoadingList: any[] | undefined,
  setcourseDownloadLoadingList: React.Dispatch<React.SetStateAction<any[]>>
}

export const AppStateContext = createContext<AppStateContextType>({
  courseDownloadLoadingList: [],
  setcourseDownloadLoadingList: () => { },
})

export const AppStateContextStore: FC<IAppStateContextStore> = ({ children }) => {
  const [courseDownloadLoadingList, setcourseDownloadLoadingList] = useState<Array<any>>([])

  return (
    <AppStateContext.Provider
      value={{
        courseDownloadLoadingList,
        setcourseDownloadLoadingList,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}