import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { RemoveBgUploader } from '@/features/ai-remover/RemoveBgUploader';
import { FAQ } from '@/templates/FAQ';
import { Features } from '@/templates/Features';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/Pricing';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const IndexPage = (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);

  return (
    <>
      <Navbar />
      <main className="min-h-screen space-y-12 pb-16">
        <section id="upload" className="scroll-mt-24">
          <RemoveBgUploader />
        </section>

        <section id="features" className="scroll-mt-24">
          <Features />
        </section>

        <section id="pricing" className="scroll-mt-24">
          <Pricing />
        </section>

        <section id="faq" className="scroll-mt-24">
          <FAQ />
        </section>
      </main>
    </>
  );
};

export default IndexPage;
