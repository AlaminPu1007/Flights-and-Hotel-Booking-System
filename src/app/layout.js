import '@/assets/scss/utils/globals.scss';
import '@/assets/scss/utils/_bootstrap.scss';
import 'react-toastify/dist/ReactToastify.css';

import StoreProvider from '@/lib/StoreProvider';

// integrate custom font
import { Barlow } from 'next/font/google';
import HeaderComponent from '@/components/layouts/header/HeaderComponent';
import FooterComponent from '@/components/layouts/footer/FooterComponent';
import { ToastContainer } from 'react-toastify';

const barlow = Barlow({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
    title: 'Flight and hotel booking system',
    description: 'Generated by Alamin',
};

// for hydrationWarning issue
// [solution from stack overflow](https://stackoverflow.com/questions/75337953/what-causes-nextjs-warning-extra-attributes-from-the-server-data-new-gr-c-s-c)

export default function RootLayout({ children, pageProps }) {
    return (
        <StoreProvider>
            <html lang='en'>
                <body suppressHydrationWarning={true} className={barlow.className}>
                    <HeaderComponent />
                    <main>{children}</main>
                    <FooterComponent />
                    <ToastContainer />
                </body>
            </html>
        </StoreProvider>
    );
}