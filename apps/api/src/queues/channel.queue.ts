
export enum QueueChannel {
    AudioMetadata = "audio-metadata",
    Emails = "emails",
    UnlockUsers = "users", 
  }
  
  export enum JobChannel {
    extractAudioMetadata = "audio:metadata",
    SendEmail = "emails:send",
    SendOTPEmail = "emails:send-otp-email",
    SendPasswordResetEmail = "emails:send-password-reset-email",
    UnlockUsers = "user:unlock", 
  }
  