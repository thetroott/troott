import React, { Component, ReactNode } from 'react';

import { errorLogger } from '@/services/error/ErrorLoggingService';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	errorId: string | null;
}

class PosthogErrorBoundary extends Component<Props, State> {
	state: State = {
		hasError: false,
		errorId: null,
	};

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		const errorId = errorLogger.logError(error, errorInfo, {
			framework: 'React',
			reactVersion: React.version,
			env: import.meta.env.VITE_APP_ENVIRONMENT || 'unknown',
		});

		this.setState({ hasError: true, errorId });
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div>
						<h1>Something went wrong.</h1>
						<p>Please refresh or try again later.</p>
						{this.state.errorId && (
							<p style={{ fontSize: '0.8em', color: '#888' }}>
								Error ID: <code>{this.state.errorId}</code>
							</p>
						)}
					</div>
				)
			);
		}

		return this.props.children;
	}
}

export default PosthogErrorBoundary;
