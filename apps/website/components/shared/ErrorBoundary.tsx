// import React, { ReactNode, ErrorInfo, Component } from "react";

// interface Props {
//   children: ReactNode;
// }

// interface State {
//   hasError: boolean;
// }

// class ErrorBoundary extends Component<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error: Error): State {
//     // Update state so the next render shows fallback UI
//     return { hasError: true };
//   }

//   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
//     // You can log the error to an error reporting service
//     console.error("ErrorBoundary caught an error", error, errorInfo);
//   }

//   handleReset = () => {
//     this.setState({ hasError: false });
//   };

//   render() {
//     if (this.state.hasError) {
//       // Custom fallback UI
//       return (
//         <div>
//           <h2>Oops, there is an error!</h2>
//           <button onClick={this.handleReset}>Try again?</button>
//         </div>
//       );
//     }

//     return this.props.children;
//   }
// }

// export default ErrorBoundary;

export {}