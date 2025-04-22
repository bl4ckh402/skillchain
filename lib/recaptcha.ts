"use client"

import { RecaptchaVerifier } from "firebase/auth"
import { auth } from "@/lib/firebase"

// Store active reCAPTCHA instances to prevent duplicate creation
const recaptchaInstances: Record<string, RecaptchaVerifier> = {}

/**
 * Creates a unique container ID for reCAPTCHA
 * @param prefix Optional prefix for the container ID
 * @returns A unique container ID
 */
export const createRecaptchaContainerId = (prefix = 'recaptcha'): string => {
  return `${prefix}-container-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

/**
 * Creates a reCAPTCHA container in the DOM
 * @param containerId ID for the container
 * @returns The created container element
 */
export const createRecaptchaContainer = (containerId: string): HTMLElement => {
  // Remove existing container if any
  const existingContainer = document.getElementById(containerId)
  if (existingContainer && existingContainer.parentElement) {
    existingContainer.parentElement.removeChild(existingContainer)
  }
  
  // Create new container
  const container = document.createElement('div')
  container.id = containerId
  container.style.position = 'fixed'
  container.style.bottom = '0'
  container.style.right = '0'
  container.style.opacity = '0'
  container.style.pointerEvents = 'none' // Prevent interaction but allow rendering
  document.body.appendChild(container)
  
  return container
}

/**
 * Creates and renders a reCAPTCHA verifier
 * @param containerId ID of the container element
 * @param options reCAPTCHA options
 * @returns Promise resolving to the reCAPTCHA verifier
 */
export const createRecaptchaVerifier = async (
  containerId: string,
  options: {
    size?: 'invisible' | 'normal' | 'compact',
    callback?: (token: string) => void,
    'expired-callback'?: () => void
  } = {}
): Promise<RecaptchaVerifier> => {
  try {
    // Clean up existing instance for this container if it exists
    await clearRecaptchaVerifier(containerId)
    
    // Create container if it doesn't exist
    if (!document.getElementById(containerId)) {
      createRecaptchaContainer(containerId)
    }
    
    // Create new verifier with provided options
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: options.size || 'invisible',
      callback: options.callback || (() => console.log('reCAPTCHA verified')),
      'expired-callback': options['expired-callback'] || (() => console.log('reCAPTCHA expired'))
    })
    
    // Render the reCAPTCHA
    await verifier.render()
    
    // Store the instance
    recaptchaInstances[containerId] = verifier
    
    return verifier
  } catch (error) {
    console.error('Error creating reCAPTCHA verifier:', error)
    throw error
  }
}

/**
 * Clears a reCAPTCHA verifier
 * @param containerId ID of the container element
 */
export const clearRecaptchaVerifier = async (containerId: string): Promise<void> => {
  try {
    const verifier = recaptchaInstances[containerId]
    if (verifier) {
      verifier.clear()
      delete recaptchaInstances[containerId]
    }
  } catch (error) {
    console.error('Error clearing reCAPTCHA verifier:', error)
  }
}

/**
 * Clears all active reCAPTCHA verifiers
 */
export const clearAllRecaptchaVerifiers = async (): Promise<void> => {
  try {
    for (const id in recaptchaInstances) {
      await clearRecaptchaVerifier(id)
    }
  } catch (error) {
    console.error('Error clearing all reCAPTCHA verifiers:', error)
  }
}

/**
 * A hook to create and manage a reCAPTCHA verifier
 * @param options reCAPTCHA options
 * @returns An object with the container ID and methods to manage the verifier
 */
export const useRecaptcha = (options: {
  size?: 'invisible' | 'normal' | 'compact',
  callback?: (token: string) => void,
  'expired-callback'?: () => void
} = {}) => {
  const containerId = createRecaptchaContainerId()
  
  const initialize = async (): Promise<RecaptchaVerifier> => {
    return await createRecaptchaVerifier(containerId, options)
  }
  
  const cleanup = async (): Promise<void> => {
    await clearRecaptchaVerifier(containerId)
  }
  
  return {
    containerId,
    initialize,
    cleanup
  }
}