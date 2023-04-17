import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string, TypeOf } from "zod";

import styles from "../../styles/Register.module.css";

const createUserSchema = object({
  name: string().nonempty({
    message: "Name is required",
  }),
  password: string({
    required_error: "Password is required"
  }).min(6, "Password too short - should be 6 chars minimum"),
  passwordConfirmation: string({
    required_error: "passwordConfirmation is required"
  }),
  email: string({
    required_error: "Email is required"
  }).email("Invalid email"),
  
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords do not match :(",
  path: ["passwordConfirmation"],
}); 

type CreateUserInput = TypeOf<typeof createUserSchema>;


function RegisterPage() {
  const router = useRouter();
  const [registerError, setRegisterError] = useState(null);
  const { register, formState:{ errors }, handleSubmit } = useForm<CreateUserInput>({ resolver: zodResolver(createUserSchema) });

  const onSubmit = async (values: CreateUserInput) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/users`, values);
      router.push("/");
    } catch(e: any) {
      setRegisterError(e.message);
    }
  }

  console.log({ errors });
  // console.log(process.env.NEXT_PUBLIC_SERVER_ENDPOINT);

  return (
    <>
      <p>{registerError}</p>
      <div className={styles.container}>
        <section className={styles.formSection}>
          <h1 className={styles.heading}>Sign Up</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputBlock}>
              <label className={styles.label} htmlFor="email">
                Email <span className={styles.requiredLabel}>*</span>
              </label>
              <input
                className={styles.input}
                id="email"
                type="email"
                placeholder="jane.doe@example.com"
                {...register("email")}
                tabIndex={-1}
                required
              />
              <p className={styles.warningMessage}>{errors.email?.message?.toString()}</p>
            </div>

            <div className={styles.inputBlock}>
              <label className={styles.label} htmlFor="Name">
                Name <span className={styles.requiredLabel}>*</span>
              </label>
              <input
                className={styles.input}
                id="name"
                type="text"
                placeholder="Jane Doe"
                {...register("name")}
                tabIndex={-1}
                required
              />
              <p className={styles.warningMessage}>{errors.name?.message?.toString()}</p>
            </div>

            <div className={styles.inputBlock}>
              <label className={styles.label} htmlFor="password">
                Password <span className={styles.requiredLabel}>*</span>
              </label>
              <input
                className={styles.input}
                id="password"
                type="password"
                placeholder="*******"
                {...register("password")}
                minLength={6}
                tabIndex={-1}
                required
              />
              <p className={styles.warningMessage}>{errors.password?.message?.toString()}</p>
            </div>

            <div className={styles.inputBlock}>
              <label className={styles.label} htmlFor="passwordConfirmation">
                Confirm password <span className={styles.requiredLabel}>*</span>
              </label>
              <input
                className={styles.input}
                id="passwordConfirmation"
                type="password"
                placeholder="*******"
                {...register("passwordConfirmation")}
                // minLength={6}
                tabIndex={-1}
                required
              />
              <p className={styles.warningMessage}>{errors.passwordConfirmation?.message?.toString()}</p>
            </div>

            <div>
              <button tabIndex={-1} className={styles.submitButton} type="submit">SUBMIT</button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}

export default RegisterPage;