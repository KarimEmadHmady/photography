import CoverImageField from '../../../components/admin/CoverImageField';
import SectionBox from '../../../components/admin/SectionBox';
import { ServiceFormValues, SetServiceField } from '../types/service.types';

interface Props {
  values: ServiceFormValues;
  setField: SetServiceField;
}

export default function ServiceImageSection({ values, setField }: Props) {
  return (
    <SectionBox title="الصورة">
      <CoverImageField
        label="صورة الخدمة"
        value={values.mainImage}
        alt={values.name}
        previewAlt="صورة الخدمة"
        onChange={(url) => setField('mainImage', url)}
      />
    </SectionBox>
  );
}