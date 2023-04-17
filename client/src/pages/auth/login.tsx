import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string, TypeOf } from "zod";

import styles from "../../styles/Register.module.css";

const createSessionSchema = object({
  email: string().nonempty({
    message: "Email is required",
  }),
  password: string().nonempty({
    message: "Password is required",
  })
}); 

type CreateSessionInput = TypeOf<typeof createSessionSchema>;


function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState(null);
  const { register, formState:{ errors }, handleSubmit } = useForm<CreateSessionInput>({ resolver: zodResolver(createSessionSchema) });

  const onSubmit = async (values: CreateSessionInput) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/sessions`, values, { withCredentials: true });
      router.push("/");
    } catch(e: any) {
      setLoginError(e.response?.data);
      console.log(e);
    }
  }

  console.log({ errors });
  // console.log(process.env.NEXT_PUBLIC_SERVER_ENDPOINT);

  return (
    <>
      <p>{loginError}</p>
      <div className={styles.container}>
        <section className={styles.formSection}>
          <h1 className={styles.heading}>Log In</h1>
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

            <div>
              <button tabIndex={-1} className={styles.submitButton} type="submit">SUBMIT</button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}

export default LoginPage;