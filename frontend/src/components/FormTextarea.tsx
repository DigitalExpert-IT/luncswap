import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  InputProps,
  Textarea,
} from "@chakra-ui/react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

type Props = {
  error?: FieldError;
  register: UseFormRegisterReturn;
  isRequired?: boolean;
  label?: string;
  placeholder?: InputProps["placeholder"];
  flex?: FormControlProps["flex"];
};

function FormTextarea(props: Props) {
  const { placeholder, error } = props;
  return (
    <FormControl
      isRequired={props.isRequired}
      flex={props.flex}
      isInvalid={!!error}
    >
      {props.label ? <FormLabel>{props.label}</FormLabel> : null}
      <Textarea placeholder={placeholder} {...props.register} />
      <FormErrorMessage>{error?.message}</FormErrorMessage>
    </FormControl>
  );
}

export default FormTextarea;
