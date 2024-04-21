import { useContext, useEffect, useState } from "react";
import { LoginContext } from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { useDebounceValue } from "usehooks-ts";
import decodeJwtToken from "../util/jwtToken";
import useGetSearchedAuthorQuery from "../services/getSearchedAuthor";
import ArrowDownIcon from "../assets/ArrowDownIcon";
import * as yup from "yup";
import axios from "axios";
import { Field, Form, Formik } from "formik";

const CreateBook: React.FC = () => {
  const { loginCredentials, setLoginCredentials } = useContext(LoginContext);
  const navigate = useNavigate();
  useEffect(() => {
    loginCredentials.jwtToken === "" && navigate("/login");
    decodeJwtToken(loginCredentials.jwtToken)?.scope !== "ADMIN" &&
      navigate("/home");
  }, []);

  const [debouncedValue, setValue] = useDebounceValue("", 750);
  const [searchValue, setSearchValue] = useState("");
  const [showAuthorDropDown, setShowAuthorDropDown] = useState(true);
  const { isLoading, data } = useGetSearchedAuthorQuery(debouncedValue || " ");

  const book = {
    title: "",
    author: "",
    note: "",
    isbn: "",
    genre: "",
  };

  const bookSchema = yup.object().shape({
    title: yup
      .string()
      .min(2, "Title to short!")
      .max(30, "Title to long!")
      .required("You need to enter book title!"),
    author: yup.string().required("You need to select author for the book!"),
    note: yup.string().min(5, "Note to short!").max(200, "Note to long!"),
    isbn: yup
      .string()
      .min(10, "Isbn must be 10 characters long!")
      .max(10, "Isbn must be 10 characters long!")
      .required("You need to enter book ISBN!"),
    genre: yup.string().required("You need to select book genre!"),
  });

  const handleSubmit = async (values: any) => {
    const headers = { Authorization: `Bearer ${loginCredentials.jwtToken}` };
    try {
      const response = await axios.post(
        "http://localhost:8081/api/v1/book/create",
        values,
        { headers }
      );
      console.log(await response.data);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex absolute -z-10 top-0 h-[100vh] overflow-hidden">
        <div className="w-2/5 tablet:hidden">
          <img
            src="https://hips.hearstapps.com/hmg-prod/images/world-book-day-1551950741.jpg"
            alt="libraryImg"
            className="w-full object-cover object-center h-full mr-[5%]"
          />
        </div>
        <div className="w-3/5 tablet:m-0 tablet:w-full flex flex-col mx-[7%] justify-center items-center">
          <p className="m-5 font-bold text-3xl">Create Book</p>
          <Formik
            initialValues={book}
            validationSchema={bookSchema}
            onSubmit={(values, actions) => {
              actions.setSubmitting(false);
              handleSubmit(values);
            }}>
            {({ errors, touched, setFieldValue }) => {
              return (
                <Form className="my-10 w-[400px] phone:w-[300px] m-5">
                  <div className="mb-7 flex flex-col">
                    <label>Title:</label>
                    <Field
                      className="border-b-2 border-black p-2 text-lg focus:outline-none"
                      type="text"
                      name="title"
                    />
                    {errors.title && touched.title && (
                      <label className="text-sm text-red-500 font-bold">
                        {errors.title}
                      </label>
                    )}
                  </div>
                  <div className="flex flex-col mb-10">
                    <label>Author: </label>
                    <div className="relative">
                      <Field
                        type="text"
                        id="author"
                        name="author"
                        value={searchValue}
                        className="border-[1px] border-slate-200 w-full p-2 py-2 rounded-md text-lg"
                        onChange={(event: any) => {
                          setSearchValue(event.target.value);
                          setValue(event.target.value);
                          setShowAuthorDropDown(true);
                          setFieldValue("author", searchValue);
                        }}
                      />
                      <ArrowDownIcon
                        className="absolute right-3 top-4 text-slate-400 cursor-pointer"
                        onClick={() =>
                          setShowAuthorDropDown(
                            showAuthorDropDown ? false : true
                          )
                        }
                      />
                      {showAuthorDropDown && (
                        <ul className="border-[1px] border-slate-200 w-full rounded-md bg-white absolute">
                          {data?.map((author: any, index: number) => (
                            <li
                              key={index}
                              onClick={() => {
                                setSearchValue(author.fullName);
                                setShowAuthorDropDown(false);
                                setFieldValue("author", author.fullName);
                              }}
                              className="cursor-pointer border-b-1 p-2 py-1">
                              {author.fullName}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {errors.author && touched.author && (
                      <label className="text-sm text-red-500 font-bold">
                        {errors.author}
                      </label>
                    )}
                  </div>
                  <div className="mb-7 flex flex-col">
                    <Field
                      className="p-2 focus:outline-none"
                      as="textarea"
                      placeholder="Type note here..."
                      name="note"
                    />
                    {errors.note && touched.note && (
                      <label className="text-sm text-red-500 font-bold">
                        {errors.note}
                      </label>
                    )}
                  </div>
                  <div className="mb-7 flex flex-col">
                    <label>ISBN:</label>
                    <Field
                      className="border-b-2 border-black p-2 text-lg focus:outline-none"
                      type="text"
                      name="isbn"
                    />
                    {errors.isbn && touched.isbn && (
                      <label className="text-sm text-red-500 font-bold">
                        {errors.isbn}
                      </label>
                    )}
                  </div>
                  <div className="mb-7 flex flex-col">
                    <Field
                      className="p-2 text-lg focus:outline-none border-[1px] border-slate-200 rounded-md"
                      as="select"
                      name="genre"
                      placeholder="Genre...">
                      <option value="HORROR">HORROR</option>
                      <option value="THRILLER">THRILLER</option>
                      <option value="COMEDY">COMEDY</option>
                      <option value="ROMANCE">ROMANCE</option>
                      <option value="DRAMA">DRAMA</option>
                    </Field>
                    {errors.genre && touched.genre && (
                      <label className="text-sm text-red-500 font-bold">
                        {errors.genre}
                      </label>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="submit"
                      className="text-white cursor-pointer font-bold w-[200px] rounded-xl text-2xl bg-blue-500 py-3 active:bg-blue-300 shadow-lg">
                      Create
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default CreateBook;
