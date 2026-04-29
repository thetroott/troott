import HomeAddressForm from '@/components/shared/get-started/home-address-form';
import PageHeader from '@/components/shared/get-started/PageHeader';

export default function HomeProfie() {
    return (
        <>
            <div className="mb-8">
                <PageHeader
                    title="Home Address"
                    description="Fill in your current residential address."
                />
            </div>

            <div className="mt-8">
                <HomeAddressForm />
            </div>
        </>
    );
}
