import CheckRow from '../../../components/admin/CheckRow';
import SectionBox from '../../../components/admin/SectionBox';
import { ServiceFormValues, SetServiceField } from '../types/service.types';

interface Props {
  values: ServiceFormValues;
  setField: SetServiceField;
}

export default function ServiceVisibilitySection({ values, setField }: Props) {
  return (
    <SectionBox title="خيارات ظهور الخدمة">
      <div className="space-y-1">
        <CheckRow checked={values.visHomepage} onChange={(v) => setField('visHomepage', v)}>
          عرض الخدمة في الصفحة الرئيسية
        </CheckRow>
        <CheckRow checked={values.visServicesPage} onChange={(v) => setField('visServicesPage', v)}>
          عرض في صفحة الخدمات المخصصة
        </CheckRow>
        <CheckRow checked={values.visAllLocations} onChange={(v) => setField('visAllLocations', v)}>
          عرض تلقائي مع كافة أماكن التصوير كخدمة مقترحة
        </CheckRow>
      </div>
    </SectionBox>
  );
}