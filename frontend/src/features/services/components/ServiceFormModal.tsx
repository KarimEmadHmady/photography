import AdminModal from '../../../components/admin/AdminModal';
import { useServiceForm } from '../hooks/useServiceForm';
import ServiceBasicFields from './ServiceBasicFields';
import ServiceImageSection from './ServiceImageSection';
import ServicePriceSection from './ServicePriceSection';
import ServicePublishSection from './ServicePublishSection';
import ServiceVisibilitySection from './ServiceVisibilitySection';

type FormApi = ReturnType<typeof useServiceForm>;

export default function ServiceFormModal({ form }: { form: FormApi }) {
  const { isOpen, editingService, submitting, formError, values, setField, changeName, close, submit } =
    form;

  if (!isOpen) return null;

  return (
    <AdminModal
      title={editingService ? 'تعديل بيانات الخدمة' : 'إضافة خدمة جديدة'}
      submitLabel={editingService ? 'حفظ التعديلات' : 'إنشاء الخدمة'}
      submitting={submitting}
      formError={formError}
      onClose={close}
      onSubmit={submit}
    >
      <ServiceBasicFields values={values} setField={setField} onNameChange={changeName} />
      <ServicePriceSection values={values} setField={setField} />
      <ServiceImageSection values={values} setField={setField} />
      <ServiceVisibilitySection values={values} setField={setField} />
      <ServicePublishSection values={values} setField={setField} />
    </AdminModal>
  );
}