
import { ViewState } from '../types';
import { useState, useCallback,  } from 'react';
export function useMapState() {
    // Rename setViewState to updateViewState
    const [viewState, setViewState] = useState<ViewState>({
      longitude: -86.4512,
      latitude: 34.6568,
      zoom: 7,
    bearing: 0,
      pitch: 0,
      padding: 0
    });
  
    const updateViewState = useCallback(
      (newViewState: Partial<ViewState>) => {
       setViewState((prevState) => ({
          ...prevState,
          ...newViewState
        }));
      },
      []
    );
  
    return { viewState, updateViewState };
  }