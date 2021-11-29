import React, { useLayoutEffect, useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Image,
    ImageBackground
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import {
    onSnapshot,
    addDoc,
    removeDoc,
    updateDoc,
} from "../services/collections";
import { firestore, auth } from "firebase";

const ListButton = ({ title, color, onPress, onDelete, onOptions }) => {
    return (
        <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: color }]}
            onPress={onPress}
        >
            <View>
                <Text style={styles.itemTitle}>{title}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={onOptions}>
                    <Ionicons name="options-outline" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete}>
                    <Ionicons name="trash-bin-outline" size={30} color="white" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const renderAddListIcon = (navigation, addItemToLists) => {
    return (
        <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
                style={{ justifyContent: "center", marginRight: 15 }}
                onPress={() => navigation.navigate("Settings")}
            >
                <Ionicons name="settings-outline" size={25} />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate("Edit", { saveChanges: addItemToLists })
                }
                style={{ justifyContent: "center", marginRight: 25 }}
            >
                {/* <Text style={styles.icon}>+</Text> */}
                <Ionicons name="add-circle-outline" size={25} />
            </TouchableOpacity>
        </View>
    );
};

export default ({ navigation }) => {
    const [lists, setLists] = useState([]);
    const listsRef = firestore()
        .collection("users")
        .doc(auth().currentUser.uid)
        .collection("lists");

    useEffect(() => {
        onSnapshot(
            listsRef,
            (newLists) => {
                setLists(newLists);
            },
            {
                sort: (a, b) => {
                    if (a.index < b.index) {
                        return -1;
                    }

                    if (a.index > b.index) {
                        return 1;
                    }

                    return 0;
                },
            }
        );
    }, []);

    const addItemToLists = ({ title, color }) => {
        const index = lists.length > 1 ? lists[lists.length - 1].index + 1 : 0;
        addDoc(listsRef, { title, color, index });
    };

    const removeItemFromLists = (id) => {
        removeDoc(listsRef, id);
    };

    const updateItemFromLists = (id, item) => {
        updateDoc(listsRef, id, item);
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => renderAddListIcon(navigation, addItemToLists),
        });
    });

    return (
        <View style={styles.container}>
            {/* <ImageBackground
                source={require('../assets/onboarding-img3.png')}
                style={styles.backgroundImg}> */}
            
            <FlatList
                data={lists}
                renderItem={({ item: { title, color, id, index } }) => {
                    return (
                        <ListButton
                            title={title}
                            color={color}
                            navigation={navigation}
                            onPress={() => {
                                navigation.navigate("ToDoList", {
                                    title,
                                    color,
                                    listId: id,
                                });
                            }}
                            onOptions={() => {
                                navigation.navigate("Edit", {
                                    title,
                                    color,
                                    saveChanges: (newItem) =>
                                        updateItemFromLists(id, {
                                            index,
                                            ...newItem,
                                        }),
                                });
                            }}
                            onDelete={() => removeItemFromLists(id)}
                        />
                    );
                }}
            />
            {/* </ImageBackground> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        
    },
    itemTitle: { fontSize: 24, padding: 5, color: "white" },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 80,
        flex: 1,
        borderRadius: 15,
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 12,
        elevation: 5,
    },
    icon: {
        padding: 5,
        fontSize: 40,
    },
    centeredView: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backgroundImg: {
        width: '100%',
        height: '100%',
        flex: 1
    }
});
