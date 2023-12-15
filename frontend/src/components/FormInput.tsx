import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
} from "@chakra-ui/react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

type Props = {
  error?: FieldError;
  register: UseFormRegisterReturn;
  isRequired?: boolean;
  label?: string;
  placeholder?: InputProps["placeholder"];
  type?: InputProps["type"];
  flex?: FormControlProps["flex"];
};

function FormInput(props: Props) {
  const { placeholder, error } = props;
  return (
    <FormControl
      isRequired={props.isRequired}
      flex={props.flex}
      isInvalid={!!error}
    >
      {props.label ? <FormLabel>{props.label}</FormLabel> : null}
      <Input placeholder={placeholder} type={props.type} {...props.register} />
      <FormErrorMessage>{error?.message}</FormErrorMessage>
    </FormControl>
  );
}

export default FormInput;
