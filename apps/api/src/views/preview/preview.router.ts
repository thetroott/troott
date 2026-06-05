import { Router, Request, Response, NextFunction } from 'express';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const previewRoutes: Router = Router({ mergeParams: true });

// List all available templates
previewRoutes.get('/templates', (req: Request, res: Response) => {
    // __dirname is /apps/api/src/views/preview, so go up one level to /apps/api/src/views
    const viewsPath = join(__dirname, '..');
    const templates: string[] = [];

    function scanDirectory(dir: string, basePath: string = '') {
        const files = readdirSync(dir);
        files.forEach((file) => {
            const filePath = join(dir, file);
            const stat = statSync(filePath);
            if (stat.isDirectory()) {
                scanDirectory(filePath, join(basePath, file));
            } else if (file.endsWith('.pug')) {
                const relativePath = join(basePath, file.replace('.pug', ''));
                templates.push(relativePath);
            }
        });
    }

    scanDirectory(viewsPath);
    res.json({
        error: false,
        data: templates,
        message: 'Available Pug templates',
    });
});

// Preview report templates (must come before /:category/:template)
previewRoutes.get(
    '/reports/:template',
    (req: Request, res: Response, next: NextFunction) => {
        const { template } = req.params;
        if (!template) {
            return res.status(400).json({
                error: true,
                message: 'Template parameter is required',
            });
        }
        const templatePath = `reports/${template}`;

        const sampleData = {
            title: 'Sample Report',
            date: new Date().toLocaleDateString(),
            data: [],
            ...req.query,
        };

        res.render(
            templatePath,
            sampleData,
            (err: Error | null, html: string | undefined) => {
                if (err) {
                    return next(err);
                }
                res.send(html);
            },
        );
    },
);

// Preview legal templates (must come before /:category/:template)
previewRoutes.get(
    '/legal/:template',
    (req: Request, res: Response, next: NextFunction) => {
        const { template } = req.params;
        if (!template) {
            return res.status(400).json({
                error: true,
                message: 'Template parameter is required',
            });
        }
        const templatePath = `emails/legal/${template}`;

        const sampleData: Record<string, any> = {
            'terms-and-conditions': {
                name: 'Damola',
                effectiveDate: 'January 1, 2026',
                termsLink: 'https://troott.com/terms',
                keyChanges: [
                    'Clarified data usage and privacy practices',
                    'Updated service description and features',
                    'Enhanced user rights and responsibilities',
                    'Added new provisions for international users',
                ],
            },
        };

        const data = sampleData[template as string] || {
            name: 'Damola',
            ...req.query,
        };

        res.render(
            templatePath,
            data,
            (err: Error | null, html: string | undefined) => {
                if (err) {
                    return next(err);
                }
                res.send(html);
            },
        );
    },
);

// Preview email templates (catch-all for emails - must come last)
previewRoutes.get(
    '/:category/:template',
    (req: Request, res: Response, next: NextFunction) => {
        const { category, template } = req.params;
        if (!category || !template) {
            return res.status(400).json({
                error: true,
                message: 'Category and template parameters are required',
            });
        }
        const templatePath = `emails/${category}/${template}`;

        // Sample data for different template types
        const sampleData: Record<string, any> = {
            'forgot-password': {
                name: 'Damola',
                resetLink: 'https://troott.com/reset-password?token=abc123',
                expiry: '24 hours',
            },
            'reset-password': {
                name: 'Damola',
                loginLink: 'https://troott.com/login',
            },
            'verify-otp': {
                name: 'Damola',
                code: '596145',
                expiry: '10 minutes',
            },
            welcome: {
                name: 'Damola',
                loginLink: 'https://troott.com/login',
                templateLink: 'https://troott.com/templates',
                inviteLink: 'https://troott.com/invite',
                guideLink: 'https://troott.com/guide',
            },
            discount: {
                name: 'Damola',
                discountCode: 'SAVE20',
                discountPercent: 20,
                expiryDate: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString(),
            },
            'newsletter-suscriber': {
                name: 'Damola',
                unsubscribeLink:
                    'https://troott.com/unsubscribe?token=xyz789',
            },
            'first-week': {
                name: 'Damola',
                templateLink: 'https://troott.com/templates',
            },
            trialactivation: {
                name: 'Damola',
                trialEndDate: new Date(
                    Date.now() + 14 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString(),
            },
            noreply: {
                name: 'Damola',
                message: 'This is a sample support message.',
            },
            transactions: {
                name: 'Damola',
                transactionId: 'TXN-123456',
                amount: '$99.99',
                date: new Date().toLocaleDateString(),
            },
            confirmation: {
                name: 'Damola',
                confirmationLink: 'https://troott.com/confirm?token=abc123',
            },
        };

        const data = sampleData[template as string] || {
            name: 'Damola',
            ...req.query,
        };

        res.render(
            templatePath,
            data,
            (err: Error | null, html: string | undefined) => {
                if (err) {
                    return next(err);
                }
                res.send(html);
            },
        );
    },
);

export default previewRoutes;
