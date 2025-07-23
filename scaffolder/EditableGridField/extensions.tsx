import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';
import { EditableGridField } from './EditableGridField';

export const EditableGridFieldExtension = scaffolderPlugin.provide(
    createScaffolderFieldExtension({
        name: 'EditableGrid',
        component: EditableGridField,
    }),
);