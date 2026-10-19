import AdminModal from '../../../components/admin/AdminModal';
import { IRegion } from '../../../types';
import { useLocationForm } from '../hooks/useLocationForm';
import BasicInfoSection from './BasicInfoSection';
import ImagesSection from './ImagesSection';
import PricingSection from './PricingSection';
import PublishSection from './PublishSection';

type FormApi = ReturnType<typeof useLocationForm>;

interface Props {
    form: FormApi;
    regions: IRegion[];
}

export default function LocationFormModal({ form, regions }: Props) {
    const {
        isOpen,
        editingLoc,
        submitting,
        formError,
        values,
        setField,
        changeName,
        addGalleryImage,
        addGalleryImages,
        removeGalleryImage,
        close,
        submit,
    } = form;

    if (!isOpen) return null;

    return (
        <AdminModal
            size="lg"
            title={editingLoc ? 'تعديل مكان التصوير' : 'إضافة مكان تصوير جديد'}
            submitLabel={editingLoc ? 'حفظ التعديلات' : 'إنشاء مكان التصوير'}
            submitting={submitting}
            formError={formError}
            onClose={close}
            onSubmit={submit}
        >
            <BasicInfoSection
                values={values}
                setField={setField}
                onNameChange={changeName}
                regions={regions}
            />
            <PricingSection values={values} setField={setField} />
            <ImagesSection
                values={values}
                setField={setField}
                onGalleryAdd={addGalleryImage}
                onGalleryAddMany={addGalleryImages}
                onGalleryRemove={removeGalleryImage}
            />
            <PublishSection values={values} setField={setField} />
        </AdminModal>
    );
}